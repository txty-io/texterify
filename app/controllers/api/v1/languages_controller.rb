class Api::V1::LanguagesController < Api::V1::ApiController
  def index
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

    languages = project.languages.order(:name)
    if params[:search]
      languages = project.languages.where(
        'name ilike :search',
        search: "%#{params[:search]}%"
      ).order(:name)
    end

    options = {}
    options[:meta] = { total: languages.count }
    options[:include] = [:country_code]
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

    language = Language.new(language_params)
    language.project = project
    language.country_code = country_code if country_code

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
      errors = []
      language.errors.each do |error|
        errors.push(
          details: language.errors[error][0]
        )
      end
      render json: {
        errors: errors
      }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    language = project.languages.find(params[:id])

    # Update country code
    country_code = CountryCode.find_by(id: params[:country_code])
    language.country_code = country_code if country_code

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
        error: true,
        errors: language.errors.full_messages
      }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    language_to_destroy = project.languages.find(params[:language][:id])
    project.languages.delete(language_to_destroy)

    render json: {
      success: true,
      details: 'Language deleted'
    }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    languages_to_destroy = project.languages.find(params[:languages])
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
