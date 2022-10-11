require 'rails_helper'

RSpec.describe ValidationViolation, type: :model do
  it 'creates a validation violation' do
    project = create(:project, :with_organization)
    language = create(:language, project_id: project.id)
    key = create(:key, project_id: project.id)
    translation = create(:translation, language_id: language.id, key_id: key.id)

    v = ValidationViolation.new
    v.name = 'my name'
    v.project_id = project.id
    v.translation_id = translation.id
    v.save!
  end
end
