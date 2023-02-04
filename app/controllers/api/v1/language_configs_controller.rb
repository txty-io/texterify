class Api::V1::LanguageConfigsController < Api::V1::ApiController
  def index
    project = current_user.projects.find(params[:project_id])
    export_config = project.export_configs.find(params[:export_config_id])

    authorize LanguageConfig.new(export_config_id: export_config.id)

    language_configs = export_config.language_configs
    render json: LanguageConfigSerializer.new(language_configs).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])
    export_config = project.export_configs.find(params[:export_config_id])
    language = project.languages.find(params[:language_id])

    language_config = LanguageConfig.new(language_config_params)
    language_config.export_config = export_config
    language_config.language = language

    authorize language_config

    if language_config.save
      render json: LanguageConfigSerializer.new(language_config).serialized_json
    else
      render json: { errors: language_config.errors.details }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    export_config = project.export_configs.find(params[:export_config_id])
    language_config = export_config.language_configs.find(params[:id])

    authorize language_config

    language = project.languages.find(params[:language_id])
    language_config.language = language

    if language_config.update(language_config_params)
      render json: ExportConfigSerializer.new(export_config).serialized_json
    else
      render json: { errors: language_config.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    export_config = project.export_configs.find(params[:export_config_id])
    language_config = export_config.language_configs.find(params[:id])

    authorize language_config

    if language_config.destroy
      render json: { success: true }
    else
      render json: { errors: language_config.errors.details }, status: :bad_request
    end
  end

  private

  def language_config_params
    params.require(:language_config).permit(:language_code)
  end
end
