require 'rails_helper'

RSpec.describe ResetMachineTranslationCharactersUsageWorker, type: :worker do
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

  it 'enqueues a ResetMachineTranslationCharactersUsageWorker' do
    user = FactoryBot.create(:user_with_organizations, organizations_count: 1)

    organization = user.organizations.first
    organization.machine_translation_character_usage = 1337
    organization.save!

    project = FactoryBot.create(:project, :with_organization)
    project.machine_translation_character_usage = 1337
    project.save!

    expect(organization.machine_translation_character_usage).to eq(1337)
    expect(project.machine_translation_character_usage).to eq(1337)

    ResetMachineTranslationCharactersUsageWorker.perform_async

    expect(ResetMachineTranslationCharactersUsageWorker.jobs.size).to eq(1)

    ResetMachineTranslationCharactersUsageWorker.drain

    organization.reload
    project.reload

    expect(organization.machine_translation_character_usage).to eq(0)
    expect(project.machine_translation_character_usage).to eq(0)
  end
end
