require 'rails_helper'

RSpec.describe WordpressContent, type: :model do
  it 'creates a wordpress content' do
    project = create(:project, :with_organization)

    w = WordpressContent.new
    w.wordpress_id = 'my id'
    w.wordpress_modified = Time.now.utc
    w.wordpress_type = 'my type'
    w.wordpress_status = 'my status'
    w.wordpress_content_type = 'my content type'
    w.project_id = project.id
    w.save!
  end
end
