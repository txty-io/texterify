require 'sidekiq-scheduler'

# Sends notifications to users if the trial is going to expire soon.
class TrialEndingWorker
  include Sidekiq::Worker

  def perform(*_args)
    if Texterify.cloud? || Rails.env.development? || Rails.env.test?
      topic = SentEmail::SUBSCRIPTION_EXPIRES_IN_ONE_DAY

      trials_expiring_in_one_day = Organization.where(
        'trial_ends_at >= ? AND trial_ends_at <= ?',
        DateTime.current.utc,
        (DateTime.current + 1.day).utc
      ).where.not(
        SentEmail
          .where('organizations.id = sent_emails.id AND sent_emails.topic = ?', topic)
          .limit(1).arel.exists
      )

      trials_expiring_in_one_day.each do |organization|
        organization.owners.each do |owner|
          sent_email = SentEmail.new
          sent_email.topic = SentEmail::SUBSCRIPTION_EXPIRES_IN_ONE_DAY
          sent_email.sent_at = Time.now.utc
          sent_email.organization_id = organization.id
          sent_email.user_id = owner.id
          sent_email.save!

          SubscriptionMailer.trial_expiring(owner, organization).deliver_later
        end
      end
    end
  end
end
