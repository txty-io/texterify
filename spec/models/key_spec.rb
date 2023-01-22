require 'rails_helper'

RSpec.describe Key, type: :model do
  it 'creates a key' do
    project = create(:project, :with_organization)
    project.save!

    expect(project.organization.keys_count).to eq(0)

    key = Key.new

    # Test strip of leading and trailing whitesapces.
    key.name = '  key name  '
    key.project = project
    key.save!

    # Test if organization keys count correctly updates.
    expect(project.organization.keys_count).to eq(1)
    key.destroy!
    expect(project.organization.keys_count).to eq(0)
  end
end
