require 'rails_helper'

RSpec.describe ProjectInvite, type: :model do
  it 'normalizes email addresses' do
    invite = described_class.create!(project: create(:project), email: '  Example@Foo.Bar ', role: ROLE_TRANSLATOR)

    expect(invite.email).to eq('example@foo.bar')
  end

  it 'finds email addresses case-insensitively' do
    invite = described_class.create!(project: create(:project), email: 'example@foo.bar', role: ROLE_TRANSLATOR)

    expect(described_class.for_email('Example@foo.bar')).to contain_exactly(invite)
  end

  it 'finds legacy invites that were stored with mixed capitalization' do
    invite = described_class.create!(project: create(:project), email: 'example@foo.bar', role: ROLE_TRANSLATOR)
    invite.update_column(:email, 'Example@Foo.Bar')

    expect(described_class.for_email('example@foo.bar')).to contain_exactly(invite)
  end
end
