require 'rails_helper'

RSpec.describe Import, type: :model do
  it 'creates an import' do
    project = create(:project, :with_organization)
    project.save!

    import = Import.new
    import.name = 'My import'
    import.status = 'CREATED'
    import.project_id = project.id
    import.save!
  end
end
