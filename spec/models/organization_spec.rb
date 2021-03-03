require 'rails_helper'

RSpec.describe Organization, type: :model do
  it 'return correct amount of trial days left if no trial is present' do
    organization = Organization.new
    organization.name = 'Test'
    organization.save!

    expect(organization.trial_ends_at).to eq(nil)
    expect(organization.trial_days_left).to eq(0)
  end

  it 'return correct amount of trial days left' do
    organization = Organization.new
    organization.name = 'Test 1'
    organization.trial_ends_at = Time.now.utc + 1.hour
    organization.save!

    expect(organization.trial_days_left).to eq(1)

    organization = Organization.new
    organization.name = 'Test 2'
    organization.trial_ends_at = Time.now.utc + 25.hours
    organization.save!

    expect(organization.trial_days_left).to eq(2)

    organization = Organization.new
    organization.name = 'Test 3'
    organization.trial_ends_at = Time.now.utc + 7.days
    organization.save!

    expect(organization.trial_days_left).to eq(7)
  end
end
