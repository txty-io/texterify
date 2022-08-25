require 'rails_helper'

RSpec.describe WordpressPolylangConnection, type: :model do
  it 'creates a wordpress polylang connection' do
    project = create(:project, :with_organization)

    w = WordpressPolylangConnection.new
    w.project_id = project.id
    w.save!
  end
end
