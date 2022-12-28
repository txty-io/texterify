class ImportImportWorker
  include Sidekiq::Worker

  def perform(background_job_id, project_id, import_id)
    background_job = BackgroundJob.find(background_job_id)
    background_job.start!
    background_job.progress!(20)

    project = Project.find(project_id)

    background_job.complete!
  end
end
