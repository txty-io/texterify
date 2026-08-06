require 'rails_helper'

RSpec.describe ImportImportWorker, type: :worker do
  describe '#perform' do
    it 'creates follow-up jobs without a user when the initiating user was deleted' do
      project = create(:project)
      import = Import.create!(project: project, name: 'Import', status: IMPORT_STATUS_IMPORTING)
      background_job =
        BackgroundJob.create!(project: project, import: import, status: 'CREATED', job_type: 'IMPORT_IMPORT')

      described_class.new.perform(background_job.id, project.id, import.id, SecureRandom.uuid)

      follow_up_jobs = project.background_jobs.where(job_type: ['RECHECK_ALL_VALIDATIONS', 'CHECK_PLACEHOLDERS'])
      expect(follow_up_jobs.count).to eq(2)
      expect(follow_up_jobs.pluck(:user_id)).to all(be_nil)
    end
  end
end
