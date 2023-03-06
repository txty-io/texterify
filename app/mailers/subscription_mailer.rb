class SubscriptionMailer < ApplicationMailer
  def trial_expiring(owner, organization)
    @username = owner.username
    @organization = organization
    @manage_subscription_link = "https://app.txty.io/dashboard/organizations/#{organization.id}/subscription"
    mail(to: owner.email, subject: 'Your trial is expiring')
  end
end
