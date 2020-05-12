class Api::V1::LanguagesController < Api::V1::ApiController
  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    page = 0
    if params[:page].present?
      page = (params[:page].to_i || 1) - 1
      page = 0 if page < 0
    end

    per_page = project.languages.size
    if params[:per_page].present?
      per_page = params[:per_page].to_i || project.languages.size
      per_page = project.languages.size if per_page < 1
    end

    languages = project.languages
    if params[:search]
      languages = project.languages
        .where(
          'name ilike :search',
          search: "%#{params[:search]}%"
        )
        .distinct
    end

    options = {}
    options[:meta] = { total: languages.count }
    options[:include] = [:country_code, :language_code]
    render json: LanguageSerializer.new(
      languages.offset(page * per_page).limit(per_page),
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
    country_code = CountryCode.find_by(id: params[:country_code])
    language_code = LanguageCode.find_by(id: params[:language_code])

    language = Language.new(language_params)
    language.project = project
    language.country_code = country_code if country_code
    language.language_code = language_code if language_code
    authorize language

    if params[:is_default]
      current_default_language = project.languages.find_by(is_default: true)
      current_default_language&.update(is_default: false)
      language.is_default = params[:is_default]
    end

    if params[:parent].present?
      language.parent = project.languages.find(params[:parent])
    end

    if language.save
      # Show language column for all users of the project.
      project_columns = project.project_columns.where(project_id: project.id)
      project_columns.each do |project_column|
        project_column.languages << language
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

    if params[:is_default]
      current_default_language = project.languages.find_by(is_default: true)
      # Avoid multiple updates of same language.
      if current_default_language&.id != language.id
        current_default_language&.update(is_default: false)
      end
      language.is_default = params[:is_default]
    end

    if params.key? :parent
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
    project.languages.delete(language_to_destroy)

    render json: {
      success: true,
      details: 'Language deleted'
    }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    languages_to_destroy = project.languages.find(params[:languages])
    languages_to_destroy.each { |language| authorize language }
    project.languages.delete(languages_to_destroy)

    render json: {
      sucess: true,
      details: 'Languages deleted'
    }
  end

  private

  def language_params
    params.require(:language).permit(:name)
  end
end
