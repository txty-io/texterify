class Api::V1::BackgroundJobsController < Api::V1::ApiController
  def index
    project = current_user.projects.find(params[:project_id])

    authorize BackgroundJob.new(project_id: project.id)

    background_jobs = project.background_jobs

    if params[:status]
      background_jobs = background_jobs.where(status: params[:status])
    end

    if params[:job_types]
      background_jobs = background_jobs.where(job_type: params[:job_types])
    end

    options = {}
    options[:meta] = { total: background_jobs.size }
    options[:include] = []
    render json: BackgroundJobSerializer.new(background_jobs, options).serialized_json
  end

  def show
    project = current_user.projects.find(params[:project_id])

    authorize BackgroundJob.new(project_id: project.id)

    background_job = project.background_jobs.find_by(id: params[:id])

    options = {}
    options[:include] = []
    render json: BackgroundJobSerializer.new(background_job, options).serialized_json
  end
end
