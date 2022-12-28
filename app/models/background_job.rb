class BackgroundJob < ApplicationRecord
  belongs_to :project
  belongs_to :user
  belongs_to :import, optional: true

  validates :status, presence: true
  validates :progress, presence: true
  validates :job_type, presence: true

  # Starts the background job and sends an event to the channel.
  def start!
    self.status = 'RUNNING'
    self.save!
    JobsChannel.broadcast_to(self.user, event: 'JOB_STARTED', type: self.job_type, project_id: self.project_id)
  end

  # Update the background job progress and sends an event to the channel.
  def progress!(new_progress)
    self.progress = new_progress
    self.save!
    JobsChannel.broadcast_to(self.user, event: 'JOB_PROGRESS', type: self.job_type, project_id: self.project_id)
  end

  # Completes the background job and sends an event to the channel.
  def complete!
    self.status = 'COMPLETED'
    self.progress = 100
    self.save!
    JobsChannel.broadcast_to(self.user, event: 'JOB_COMPLETED', type: self.job_type, project_id: self.project_id)
  end
end
