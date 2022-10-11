require 'rails_helper'

RSpec.describe Flavor, type: :model do
  it 'creates a flavor' do
    project = create(:project, :with_organization)
    project.save!

    flavor = Flavor.new
    flavor.name = 'flavor name'
    flavor.project = project
    flavor.save!
  end
end
