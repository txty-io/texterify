class Api::V1::ValidationsController < Api::V1::ApiController
  def index
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    options = {}
    options[:meta] = { total: project.validations.size }
    options[:include] = []
    render json: ValidationSerializer.new(
      project.validations
        .order('name ASC')
        .offset(page * per_page)
        .limit(per_page),
      options
    ).serialized_json
  end

  def create
    project = Project.find(params[:project_id])

    validation = Validation.new(validation_params)
    validation.project = project

    authorize validation

    # return unless feature_enabled?(project, Organization::FEATURE_OTA)

    if validation.save
      render json: {
        success: true,
        details: 'VALIDATION_CREATED'
      }, status: :ok
    else
      render json: {
        errors: language.errors.details
      }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    validation = project.validations.find(params[:id])

    authorize validation

    if validation.update(validation_params)
      render json: ValidationSerializer.new(validation).serialized_json
    else
      render json: {
        errors: validation.errors.details
      }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    validation = project.validations.find(params[:id])

    authorize validation

    validation.destroy!

    render json: {
      success: true,
      details: 'DESTROYED'
    }
  end

  private

  def validation_params
    params.require(:validation).permit(:name, :description, :match, :content, :enabled)
  end
end
