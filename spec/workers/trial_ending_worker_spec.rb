require 'rails_helper'

RSpec.describe TrialEndingWorker, type: :worker do
  let(:time) { (Time.now.end_of_day.utc + 4.hours).to_datetime }
  let(:scheduled_job) { described_class.perform_in(time) }

  it 'job in correct queue' do
    described_class.perform_async
    assert_equal 'default', described_class.queue
  end

  it 'occurs at expected time' do
    scheduled_job
    assert_equal true, described_class.jobs.last['jid'].include?(scheduled_job)
    expect(described_class).to have_enqueued_sidekiq_job
  end

  it 'enqueues a TrialEndingWorker' do
    user = create(:user_with_organizations, organizations_count: 1)
    organization = user.organizations.first

    organization.trial_ends_at = Time.now.utc + 1.day
    organization.save!

    organization_user = organization.organization_users.first
    organization_user.role = 'owner'
    organization_user.save!

    expect(SentEmail.all.size).to eq(0)

    TrialEndingWorker.perform_async

    expect(TrialEndingWorker.jobs.size).to eq(1)

    TrialEndingWorker.drain

    expect(SentEmail.all.size).to eq(1)
  end
end
