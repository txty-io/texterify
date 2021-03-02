require 'sidekiq-scheduler'

# Sends notifications to users if the trial is going to expire soon.
class TrialEndingWorker
  include Sidekiq::Worker

  def perform(*_args)
    trials_expiring_in_one_day = Organization.where(
      'trial_ends_at >= ? AND trial_ends_at <= ?',
      DateTime.current.utc,
      (DateTime.current + 1.day).utc
    )
  end
end
