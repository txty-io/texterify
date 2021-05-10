class Api::V1::LanguagesController < Api::V1::ApiController
  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    languages = project.languages
    if params[:search]
      languages = project.languages
        .where(
          'name ilike :search',
          search: "%#{params[:search]}%"
        )
    end

    options = {}
    options[:meta] = { total: languages.size }
    options[:include] = [:country_code, :language_code]
    render json: LanguageSerializer.new(
      languages.order_by_name.offset(page * per_page).limit(per_page),
      options
    ).serialized_json
  end

  def create
    if params[:name].blank?
      render json: {
        errors: [
          {
            details: 'Missing required parameters'
          }
        ]
      }, status: :bad_request
      return
    end

    project = current_user.projects.find(params[:project_id])

    if !project.feature_enabled?(Organization::FEATURE_UNLIMITED_LANGUAGES) && project.languages.size >= 2
      skip_authorization

      render json: {
        error: true,
        message: 'MAXIMUM_NUMBER_OF_LANGUAGES_REACHED'
      }, status: :bad_request
      return
    end

    country_code = CountryCode.find_by(id: params[:country_code])
    language_code = LanguageCode.find_by(id: params[:language_code])

    language = Language.new(language_params)
    language.project = project
    language.country_code = country_code if country_code
    language.language_code = language_code if language_code
    authorize language

    if params[:is_default].present?
      if params[:is_default]
        current_default_language = project.languages.find_by(is_default: true)
        current_default_language&.update(is_default: false)
      end
      language.is_default = params[:is_default]
    end

    if params[:parent].present?
      return unless feature_enabled?(project, Organization::FEATURE_EXPORT_HIERARCHY)

      language.parent = project.languages.find(params[:parent])
    end

    if language.save
      # Show language column for all users of the project.
      project.users.each do |user|
        project_column = project.project_columns.find_by(user_id: user.id)

        if project_column
          project_column.languages << language
        else
          project_column = ProjectColumn.new
          project_column.project_id = project.id
          project_column.user_id = user.id
          project_column.languages << language
          project_column.save
        end
      end

      render json: {
        success: true,
        details: 'Language successfully created.'
      }, status: :ok
    else
      render json: {
        errors: language.errors.details
      }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    language = project.languages.find(params[:id])
    authorize language

    # Update country code
    country_code = CountryCode.find_by(id: params[:country_code])
    language.country_code = country_code if country_code

    # Update language code
    language_code = LanguageCode.find_by(id: params[:language_code])
    language.language_code = language_code if language_code

    if params[:is_default] == true || params[:is_default] == false
      if params[:is_default]
        current_default_language = project.languages.find_by(is_default: true)
        # Avoid multiple updates of same language.
        if current_default_language&.id != language.id
          current_default_language&.update(is_default: false)
        end
      end

      language.is_default = params[:is_default]
    end

    if params.key?(:parent)
      return unless feature_enabled?(project, Organization::FEATURE_EXPORT_HIERARCHY)

      if params[:parent].present?
        language.parent = project.languages.find(params[:parent])
      else
        language.parent = nil
      end
    end

    language.name = params[:language][:name] if params[:language][:name]

    if language.save
      render json: {
        message: 'Language updated'
      }
    else
      render json: {
        errors: language.errors.details
      }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    language_to_destroy = project.languages.find(params[:language][:id])
    authorize language_to_destroy
    project.languages.destroy(language_to_destroy)

    render json: {
      success: true,
      details: 'Language deleted'
    }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    languages_to_destroy = project.languages.find(params[:languages])
    languages_to_destroy.each { |language| authorize language }
    project.languages.destroy(languages_to_destroy)

    render json: {
      success: true,
      details: 'Languages deleted'
    }
  end

  private

  def language_params
    params.require(:language).permit(:name)
  end
end
