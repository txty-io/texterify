# Preview all emails at http://localhost:3000/rails/mailers/subscriptions
class SubscriptionsPreview < ActionMailer::Preview
  def trial_expiring
    owner = User.new
    owner.username = 'Christoph Werner'
    owner.email = 'test@texterify.com'

    organization = Organization.new
    organization.name = 'My Organization'
    organization.trial_ends_at = Time.now.utc + 1.day

    SubscriptionMailer.trial_expiring(owner, organization)
  end
end
