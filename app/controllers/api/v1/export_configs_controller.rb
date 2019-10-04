class Api::V1::ExportConfigsController < Api::V1::ApiController
  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    export_configs = project.export_configs.order(:name)
    render json: ExportConfigSerializer.new(export_configs).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])

    export_config = ExportConfig.new(export_config_params)
    export_config.project = project

    authorize export_config

    if export_config.save
      render json: ExportConfigSerializer.new(export_config).serialized_json
    else
      render json: {
        error: true,
        message: 'Error while creating export config'
      }, status: :bad_request
    end
  end

  def update
    export_config = ExportConfig.find(params[:id])

    authorize export_config

    if export_config.update(export_config_params)
      render json: {
        message: 'Export config updated'
      }
    else
      render json: {
        error: true,
        errors: export_config.errors.as_json
      }, status: :bad_request
    end
  end

  def destroy
    export_config = ExportConfig.find(params[:id])

    authorize export_config

    if export_config.destroy
      render json: {
        message: 'Export config updated'
      }
    else
      render json: {
        error: true,
        errors: export_config.errors.as_json
      }, status: :bad_request
    end
  end

  private

  def export_config_params
    params.require(:export_config).permit(:name, :file_format, :file_path, :default_language_file_path)
  end
end
