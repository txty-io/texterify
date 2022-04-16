class Api::V1::PlaceholdersController < Api::V1::ApiController
  # Allows to check the project for issues regarding missing placeholders.
  def check
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
      return
    end

    unless BackgroundJob.exists?(project_id: project.id, job_type: 'CHECK_PLACEHOLDERS', status: ['CREATED', 'RUNNING'])
      background_job = BackgroundJob.new
      background_job.status = 'CREATED'
      background_job.job_type = 'CHECK_PLACEHOLDERS'
      background_job.user_id = current_user.id
      background_job.project_id = project.id
      background_job.save!

      CheckPlaceholdersWorker.perform_async(background_job.id, project.id)
    end
  end
end
