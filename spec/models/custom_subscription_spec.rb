require 'rails_helper'

RSpec.describe CustomSubscription, type: :model do
  it 'creates a custom subscription' do
    s = CustomSubscription.new
    s.plan = 'my plan'
    s.provider = 'my provider'
    s.redeemable_by_email = 'my email'
    s.save!
  end
end
