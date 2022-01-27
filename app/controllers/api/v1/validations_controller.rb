class Api::V1::ValidationsController < Api::V1::ApiController
  def index
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    options = {}
    options[:meta] = { total: project.validations.size }
    options[:include] = []
    render json:
             ValidationSerializer.new(
               project.validations.order('name ASC').offset(page * per_page).limit(per_page),
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
      render json: { success: true, details: 'VALIDATION_CREATED' }, status: :ok
    else
      render json: { errors: language.errors.details }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    validation = project.validations.find(params[:id])

    authorize validation

    if validation.update(validation_params)
      render json: ValidationSerializer.new(validation).serialized_json
    else
      render json: { errors: validation.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    validation = project.validations.find(params[:id])

    authorize validation

    validation.destroy!

    render json: { success: true, details: 'DESTROYED' }
  end

  # Allows to recheck all translations for validation violations.
  # If a validation is given only that one is checked.
  # Otherwise all validations are checked.
  def recheck
    project = current_user.projects.find(params[:project_id])

    if params[:validation_id].present?
      validation = Validation.find(params[:validation_id])
      authorize validation
    else
      authorize project.validations.first
    end

    unless BackgroundJob.exists?(status: ['CREATED', 'RUNNING'])
      background_job = BackgroundJob.new
      background_job.status = 'CREATED'
      background_job.job_type = 'RECHECK_ALL_VALIDATIONS'
      background_job.user_id = current_user.id
      background_job.project_id = project.id
      background_job.save!

      CheckValidationsWorker.perform_async(background_job.id, project.id, validation&.id)
    end
  end

  private

  def validation_params
    params.require(:validation).permit(:name, :description, :match, :content, :enabled)
  end
end
