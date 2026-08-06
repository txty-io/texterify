class BackgroundJob < ApplicationRecord
  belongs_to :project
  belongs_to :user, optional: true
  belongs_to :import, optional: true

  validates :status, presence: true
  validates :progress, presence: true
  validates :job_type, presence: true

  # Starts the background job and sends an event to the channel.
  def start!
    self.status = 'RUNNING'
    self.save!
    broadcast('JOB_STARTED')
  end

  # Update the background job progress and sends an event to the channel.
  def progress!(new_progress)
    self.progress = new_progress
    self.save!
    broadcast('JOB_PROGRESS')
  end

  # Completes the background job and sends an event to the channel.
  def complete!
    self.status = 'COMPLETED'
    self.progress = 100
    self.save!
    broadcast('JOB_COMPLETED')
  end

  private

  def broadcast(event)
    user = User.find_by(id: self.user_id)
    unless user
      return
    end

    JobsChannel.broadcast_to(
      user,
      event: event,
      type: self.job_type,
      project_id: self.project_id,
      import_id: self.import_id
    )
  end
end
