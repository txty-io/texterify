# Checks the translations of a project for placeholder issues.
# Missing placeholders which are available in the source
# translation but not in the other ones are seen as an issue.
class CheckPlaceholdersWorker
  include Sidekiq::Worker

  def perform(background_job_id, project_id)
    background_job = BackgroundJob.find(background_job_id)
    background_job.start!
    background_job.progress!(20)

    project = Project.find(project_id)

    project.keys.each { |key| key.check_placeholders }

    background_job.complete!
  end
end
