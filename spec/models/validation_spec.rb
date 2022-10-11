require 'rails_helper'

RSpec.describe Validation, type: :model do
  it 'creates a validation' do
    validation = Validation.new
    validation.name = 'my list'
    validation.match = 'contains'
    validation.content = 'validation content'
    validation.save!
  end

  it 'creates a validation for a project' do
    project = create(:project, :with_organization)

    validation = Validation.new
    validation.name = 'my list'
    validation.match = 'contains'
    validation.content = 'validation content'
    validation.project_id = project.id
    validation.save!
  end

  it 'creates a validation for an organization' do
    organization = create(:organization)

    validation = Validation.new
    validation.name = 'my list'
    validation.match = 'contains'
    validation.content = 'validation content'
    validation.organization_id = organization.id
    validation.save!
  end
end
