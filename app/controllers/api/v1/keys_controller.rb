class Api::V1::KeysController < Api::V1::ApiController
  before_action :check_if_user_activated

  def info_for_paper_trail
    { project_id: params[:project_id] }
  end

  def show
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:id])

    options = {}
    options[:include] = [:translations, :'translations.language']
    render json: KeySerializer.new(key, options).serialized_json
  end

  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

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
    export_config_ids = Array(params[:export_config_ids])

    keys = project.keys.left_outer_joins(:translations)

    # Check if a search query has been applied
    if params[:search]
      eq_op = 'ilike'
      if case_sensitive
        eq_op = 'like'
      end

      # Apply search query only to given languages
      if !language_ids.empty?
        keys = keys.where('translations.language_id in (?)', language_ids)
      end

      # Apply search query only to given languages
      if !export_config_ids.empty?
        keys = keys.where('translations.export_config_id in (?)', export_config_ids)
      end

      keys = keys.match_name_or_description_or_translation_content(params[:search], eq_op, match == 'exactly')
    end

    # Check for HTML enabled keys
    if only_html_enabled
      keys = keys.where(html_enabled: true)
    end

    # Check for untranslated keys
    if only_untranslated
      ids = language_ids
      if ids.empty?
        ids = project.languages.map(&:id)
      end

      untranslated_keys =
        keys.where(
          "? != (
          select count(*)
          from translations
          where
            translations.key_id = keys.id and
            translations.export_config_id is NULL and
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
      keys = keys.where("translations.export_config_id is not NULL and coalesce(trim(translations.content), '') != ''")

      if !language_ids.empty?
        keys = keys.where('translations.language_id in (?)', language_ids)
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
    options[:include] = [:translations, :'translations.language', :tags]
    render json: KeySerializer.new(keys.offset(page * per_page).limit(per_page), options).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])

    key = Key.new(key_params)
    key.project = project
    authorize key

    if key.save
      render json: KeySerializer.new(key).serialized_json
    else
      render json: { error: true, errors: key.errors.details }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:id])
    authorize key

    html_enabled_before_update = key.html_enabled

    if key.update(permitted_attributes(key))
      # If the type of the key changes we also update the translations and convert between the
      # text and HTML editor format.
      if params.key?(:html_enabled) && params[:html_enabled] != html_enabled_before_update
        key.translations.each do |translation|
          if params[:html_enabled]
            translation.content = {
              "blocks": [{ "type": 'paragraph', "data": { "text": translation.content } }]
            }.to_json
          else
            translation.content = helpers.convert_html_translation(translation.content) || ''
          end

          translation.save!
        end
      end

      render json: { message: 'Key updated' }
    else
      render json: { errors: key.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    key_to_destroy = project.keys.find(params[:key][:id])
    authorize key_to_destroy
    key_to_destroy.destroy

    render json: { message: 'Key deleted' }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    keys_to_destroy = project.keys.find(params[:keys])
    keys_to_destroy.each { |key| authorize key }
    project.keys.destroy(keys_to_destroy)

    render json: { message: 'Keys deleted' }
  end

  def activity
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    unless feature_enabled?(project, Organization::FEATURE_KEY_HISTORY)
      return
    end

    key = project.keys.find(params[:key_id])

    options = {}
    options[:include] = [:translations, :'translations.language', :'translations.language.country_code', :key]
    render json:
             ActivitySerializer.new(key.translations.map(&:versions).flatten.sort_by(&:created_at).reverse, options)
               .serialized_json
  end

  private

  def key_params
    params.require(:key).permit(:name, :description, :html_enabled)
  end
end
