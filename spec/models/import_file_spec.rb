require 'rails_helper'

RSpec.describe ImportFile, type: :model do
  it 'creates an import file' do
    project = create(:project, :with_organization)
    project.save!

    import = Import.new
    import.name = 'My import'
    import.status = 'CREATED'
    import.project_id = project.id
    import.save!

    import_file = ImportFile.new
    import_file.name = 'My import file'
    import_file.status = 'CREATED'
    import_file.import_id = import.id
    import_file.save!
  end
end
