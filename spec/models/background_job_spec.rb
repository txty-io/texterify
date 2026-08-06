require 'rails_helper'

RSpec.describe BackgroundJob, type: :model do
  it 'updates without broadcasting when the user has been deleted' do
    background_job =
      BackgroundJob.create!(project: create(:project), status: 'CREATED', progress: 0, job_type: 'IMPORT_VERIFY')
    allow(JobsChannel).to receive(:broadcast_to)

    background_job.start!
    background_job.progress!(50)
    background_job.complete!

    expect(JobsChannel).not_to have_received(:broadcast_to)
    expect(background_job).to have_attributes(status: 'COMPLETED', progress: 100)
  end

  it 'stops broadcasting when the user is deleted between updates' do
    user = create(:user)
    background_job = BackgroundJob.create!(
      project: create(:project),
      user: user,
      status: 'CREATED',
      progress: 0,
      job_type: 'IMPORT_VERIFY'
    )
    allow(JobsChannel).to receive(:broadcast_to)

    background_job.start!
    user.destroy!
    background_job.progress!(50)

    expect(JobsChannel).to have_received(:broadcast_to).once
    expect(background_job.reload.user_id).to be_nil
  end
end
