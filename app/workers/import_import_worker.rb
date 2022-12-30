class ImportImportWorker
  include Sidekiq::Worker

  def perform(background_job_id, _project_id, import_id)
    background_job = BackgroundJob.find(background_job_id)
    background_job.start!
    background_job.progress!(20)

    import = Import.find(import_id)

    # TODO:

    import.status = IMPORT_STATUS_IMPORTED
    import.save!
    background_job.complete!
  end
end
