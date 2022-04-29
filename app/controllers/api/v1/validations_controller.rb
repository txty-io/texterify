class Api::V1::ValidationsController < Api::V1::ApiController
  def index
    skip_authorization

    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
        return
      end
      validations = project.validations
    else
      organization = current_user.organizations.find(params[:organization_id])
      unless feature_enabled?(organization, Organization::FEATURE_VALIDATIONS)
        return
      end
      validations = organization.validations
    end

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    options = {}
    options[:meta] = { total: validations.size }
    options[:include] = []
    render json:
             ValidationSerializer.new(validations.order('name ASC').offset(page * per_page).limit(per_page), options)
               .serialized_json
  end

  def create
    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
        return
      end

      validation = Validation.new(validation_params)
      validation.project = project
    else
      organization = current_user.organizations.find(params[:organization_id])
      unless feature_enabled?(organization, Organization::FEATURE_VALIDATIONS)
        return
      end

      validation = Validation.new(validation_params)
      validation.organization = organization
    end

    authorize validation

    if validation.save
      render json: { success: true, details: 'VALIDATION_CREATED' }, status: :ok
    else
      render json: { errors: validation.errors.details }, status: :bad_request
    end
  end

  def update
    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
        return
      end
      validations = project.validations
    else
      organization = current_user.organizations.find(params[:organization_id])
      unless feature_enabled?(organization, Organization::FEATURE_VALIDATIONS)
        return
      end
      validations = organization.validations
    end

    validation = validations.find(params[:id])

    authorize validation

    if validation.update(validation_params)
      render json: ValidationSerializer.new(validation).serialized_json
    else
      render json: { errors: validation.errors.details }, status: :bad_request
    end
  end

  def destroy
    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
        return
      end
      validations = project.validations
    else
      organization = current_user.organizations.find(params[:organization_id])
      unless feature_enabled?(organization, Organization::FEATURE_VALIDATIONS)
        return
      end
      validations = organization.validations
    end

    validation = validations.find(params[:id])

    authorize validation

    validation.destroy!

    render json: { success: true, details: 'DESTROYED' }
  end

  # Allows to recheck all translations for validation violations.
  # If a validation is given only that one is checked.
  # Otherwise all validations are checked.
  def recheck
    project = current_user.projects.find(params[:project_id])

    unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
      return
    end

    if params[:validation_id].present?
      validation = Validation.find(params[:validation_id])
    else
      validation = Validation.new
      validation.project = project
    end

    authorize validation

    unless BackgroundJob.exists?(
             project_id: project.id,
             job_type: 'RECHECK_ALL_VALIDATIONS',
             status: ['CREATED', 'RUNNING']
           )
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
