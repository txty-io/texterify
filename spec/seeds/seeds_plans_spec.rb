require 'rails_helper'

# rubocop:disable RSpec/DescribeClass

RSpec.describe 'Seeds:seeds_plans.rb' do
  it 'correctly seeds plans' do
    # Check if data is seeded correctly.
    Plan.delete_all
    expect(Plan.all).to eq([])

    load Rails.root.join('db', 'seeds', 'seeds_plans.rb')
    plans = Plan.all.order(name: :ASC).as_json
    expect(plans).to match_snapshot('plans', { snapshot_serializer: StripSerializer })

    # Check if it updates the data correctly.
    plan = Plan.find_by(keys_limit: nil)
    plan.keys_limit = 100
    plan.save!

    load Rails.root.join('db', 'seeds', 'seeds_plans.rb')
    plans = Plan.all.order(name: :ASC).as_json
    expect(plans).to match_snapshot('plans', { snapshot_serializer: StripSerializer })

    # Check if running seeds twice is a problem.
    load Rails.root.join('db', 'seeds', 'seeds_plans.rb')
    load Rails.root.join('db', 'seeds', 'seeds_plans.rb')
    plans = Plan.all.order(name: :ASC).as_json
    expect(plans).to match_snapshot('plans', { snapshot_serializer: StripSerializer })
  end
end

# rubocop:enable RSpec/DescribeClass
