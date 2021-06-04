class Api::V1::ValidationViolationsController < Api::V1::ApiController
  def index
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    options = {}
    options[:meta] = { total: project.validation_violations.size }
    options[:include] = [:project, :validation, :translation]
    render json: ValidationViolationSerializer.new(
      project.validation_violations
        .order('id ASC')
        .offset(page * per_page)
        .limit(per_page),
      options
    ).serialized_json
  end

  def count
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    render json: {
      total: project.validation_violations.size
    }
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    validation_violation = project.validation_violations.find(params[:id])
    authorize validation_violation
    validation_violation.destroy

    render json: {
      success: true,
      details: 'VALIDATION_VIOLATION_DELETED'
    }
  end
end
