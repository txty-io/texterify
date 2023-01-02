require 'rails_helper'

RSpec.describe ImportFileTranslation, type: :model do
  it 'creates an import file translation' do
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

    import_file_translation = ImportFileTranslation.new
    import_file_translation.key_name = 'My import file translation key name'
    import_file_translation.import_file_id = import_file.id
    import_file_translation.save!
  end
end
