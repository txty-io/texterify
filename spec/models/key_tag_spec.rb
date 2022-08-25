require 'rails_helper'

RSpec.describe KeyTag, type: :model do
  it 'creates a key tag' do
    project = create(:project, :with_organization)
    project.save!

    key = Key.new
    key.name = 'key name'
    key.project = project
    key.save!

    tag = Tag.new
    tag.name = 'tag name'
    tag.custom = false
    tag.project_id = project.id
    tag.save!

    key_tag = KeyTag.new
    key_tag.key_id = key.id
    key_tag.tag_id = tag.id
    key_tag.save!
  end
end
