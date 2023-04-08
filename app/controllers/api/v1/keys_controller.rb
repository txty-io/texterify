class Api::V1::KeysController < Api::V1::ApiController
  def info_for_paper_trail
    { project_id: params[:project_id] }
  end

  before_action :set_current_project

  # Sets the current project for the request and throws an error in case the project has been disabled.
  def set_current_project
    @project = current_user.projects.find(params[:project_id])

    if @project.disabled
      render json: { error: true, error_type: 'PROJECT_IS_DISABLED' }, status: :forbidden
      false
    end
  end

  def show
    skip_authorization
    key = @project.keys.find(params[:id])

    options = {}
    options[:include] = [:translations, :'translations.language', :tags, :placeholders]
    options[:params] = { current_user: current_user }
    render json: KeySerializer.new(key, options).serialized_json
  end

  def index
    skip_authorization

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    match = params[:match]
    case_sensitive = params[:case_sensitive] == 'true'
    only_untranslated = params[:only_untranslated] == 'true'
    only_html_enabled = params[:only_html_enabled] == 'true'
    only_with_overwrites = params[:only_with_overwrites] == 'true'
    changed_before = params[:changed_before]
    changed_after = params[:changed_after]
    language_ids = Array(params[:language_ids])
    flavor_ids = Array(params[:flavor_ids])
    tag_ids = Array(params[:tag_ids])

    keys = @project.keys.left_outer_joins(:translations).left_outer_joins(:tags)

    # Check if a search query has been applied.
    if params[:search]
      eq_op = 'ilike'
      if case_sensitive
        eq_op = 'like'
      end

      # Apply search query only to given languages.
      if !language_ids.empty?
        keys = keys.where(translations: { language_id: language_ids })
      end

      # Apply search query only to given flavors.
      if !flavor_ids.empty?
        keys = keys.where(translations: { flavor_id: flavor_ids })
      end

      keys = keys.match_name_or_description_or_translation_content(params[:search], eq_op, match == 'exactly')
    end

    if !tag_ids.empty?
      keys = keys.where(tags: { id: tag_ids })
    end

    # Check for HTML enabled keys
    if only_html_enabled
      keys = keys.where(html_enabled: true)
    end

    # Check for untranslated keys
    if only_untranslated
      ids = language_ids
      if ids.empty?
        ids = @project.languages.map(&:id)
      end

      untranslated_keys =
        keys.where(
          "? != (
          select count(*)
          from translations
          where
            translations.key_id = keys.id and
            translations.flavor_id is NULL and
            coalesce(trim(translations.content), '') != '' AND
            translations.language_id in (?)
        )",
          ids.size,
          ids
        )

      keys = keys.where(id: untranslated_keys.map(&:id))
    end

    # Check for keys with overwrites
    if only_with_overwrites
      keys = keys.where("translations.flavor_id is not NULL and coalesce(trim(translations.content), '') != ''")

      if !language_ids.empty?
        keys = keys.where(translations: { language_id: language_ids })
      end
    end

    if changed_before || changed_after
      if changed_before
        # Add 1 day because comparison uses 00:00 as time an we also want to include the selected day
        keys =
          keys.where(
            'translations.updated_at <= (:changed_before) or keys.updated_at <= (:changed_before)',
            changed_before: Date.parse(changed_before) + 1.day
          )
      end

      if changed_after
        keys =
          keys.where(
            'translations.updated_at >= (:changed_after) or keys.updated_at >= (:changed_after)',
            changed_after: changed_after
          )
      end
    end

    keys = keys.order_by_name.distinct_on_lower_name

    options = {}
    options[:meta] = { total: keys.size }
    options[:include] = [:translations, :'translations.language', :tags, :placeholders]
    options[:params] = { current_user: current_user }
    render json: KeySerializer.new(keys.offset(page * per_page).limit(per_page), options).serialized_json
  end

  def create
    if @project.organization.key_limit_reached
      skip_authorization

      render json: { error: true, message: 'MAXIMUM_NUMBER_OF_KEYS_REACHED' }, status: :bad_request
      return
    end

    key = Key.new(key_params)
    key.project = @project
    authorize key

    if key.save
      options = {}
      options[:include] = [:translations, :'translations.language', :tags, :placeholders]
      options[:params] = { current_user: current_user }
      render json: KeySerializer.new(key).serialized_json
    else
      render json: { error: true, errors: key.errors.details }, status: :bad_request
    end
  end

  def update
    if @project.organization.key_limit_exceeded
      skip_authorization

      render json: { error: true, message: 'MAXIMUM_NUMBER_OF_KEYS_EXCEEDED' }, status: :bad_request
      return
    end

    key = @project.keys.find(params[:id])
    authorize key

    if key.update(permitted_attributes(key))
      render json: { message: 'Key updated' }
    else
      render json: { errors: key.errors.details }, status: :bad_request
    end
  end

  def destroy
    key_to_destroy = @project.keys.find(params[:key][:id])
    authorize key_to_destroy
    key_to_destroy.destroy

    render json: { message: 'Key deleted' }
  end

  def destroy_multiple
    keys_to_destroy = @project.keys.find(params[:keys])
    keys_to_destroy.each { |key| authorize key }
    @project.keys.destroy(keys_to_destroy)

    render json: { message: 'Keys deleted' }
  end

  def activity
    skip_authorization

    unless @project.feature_enabled?(Plan::FEATURE_KEY_HISTORY)
      return
    end

    key = @project.keys.find(params[:key_id])

    options = {}
    options[:include] = [:translations, :'translations.language', :'translations.language.country_code', :key]
    render json:
             ActivitySerializer.new(key.translations.map(&:versions).flatten.sort_by(&:created_at).reverse, options)
               .serialized_json
  end

  private

  def key_params
    params.require(:key).permit(:name, :description, :html_enabled, :pluralization_enabled)
  end
end
