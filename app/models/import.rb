class Import < ApplicationRecord
  belongs_to :project
  belongs_to :user, optional: true

  has_many :import_files, dependent: :destroy

  validates :name, presence: true

  def verify(user)
    # unless BackgroundJob.exists?(
    #          job_type: 'IMPORT_VERIFY',
    #          user_id: user.id,
    #          project_id: self.project.id,
    #          import_id: self.id
    #        )
    background_job = BackgroundJob.new
    background_job.status = 'CREATED'
    background_job.job_type = 'IMPORT_VERIFY'
    background_job.user_id = user.id
    background_job.project_id = self.project.id
    background_job.import_id = self.id
    background_job.save!

    ImportVerifyWorker.perform_async(background_job.id, project.id, self.id)
    # end
  end
end
