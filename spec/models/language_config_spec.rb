require 'rails_helper'

RSpec.describe LanguageConfig, type: :model do
  it 'creates a language config' do
    project = create(:project, :with_organization)
    project.save!

    language = Language.new
    language.name = 'language_name'
    language.project_id = project.id
    language.save!

    export_config = ExportConfig.new
    export_config.name = 'export config name'
    export_config.file_format = FileFormat.find_by!(format: 'json')
    export_config.file_path = 'my_file_path'
    export_config.file_path = '{languageCode}-{countryCode}'
    export_config.project_id = project.id
    export_config.save!

    language_config = LanguageConfig.new
    language_config.language_code = 'en'
    language_config.language_id = language.id
    language_config.export_config_id = export_config.id
    language_config.save!
  end
end
