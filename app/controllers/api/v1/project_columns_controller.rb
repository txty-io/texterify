class Api::V1::ProjectColumnsController < Api::V1::ApiController
  def show
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    project_column = project.project_columns.find_by(project_id: project.id, user_id: current_user.id)

    options = {}
    options[:include] = [:languages]
    render json: ProjectColumnSerializer.new(project_column, options).serialized_json
  end

  def update
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    project_column = project.project_columns.find_by(project_id: project.id, user_id: current_user.id)
    project_column ||= ProjectColumn.create(project_id: project.id, user_id: current_user.id)
    project_column.languages = project.languages.find(params[:languages])

    if project_column.update(project_column_params)
      render json: project_column
    else
      errors = []
      project_column.errors.each do |error|
        errors.push(
          details: project_column.errors[error]
        )
      end
      render json: {
        errors: errors
      }, status: :bad_request
    end
  end

  private

  def project_column_params
    params.require(:project_column).permit(:show_name, :show_description)
  end
end
