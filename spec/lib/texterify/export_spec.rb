require 'texterify'

RSpec.describe Texterify::Export do
  describe 'creates language export data correctly' do
    it 'create language data correctly with for language with parent' do
      project = create(:project, :with_organization)
      language_parent = create(:language, project_id: project.id)
      language_no_connection = create(:language, project_id: project.id)
      language_child = create(:language, project_id: project.id)
      language_child.parent_id = language_parent.id
      language_child.save!
      export_config = create(:export_config, project_id: project.id)
      key1 = create(:key, project_id: project.id)
      create(:translation, key_id: key1.id, language_id: language_parent.id)

      language_child_data =
        Texterify::Export.create_language_export_data(project, export_config, language_child, [], skip_timestamp: true)
      language_parent_data =
        Texterify::Export.create_language_export_data(project, export_config, language_parent, [], skip_timestamp: true)
      language_no_connection_data =
        Texterify::Export.create_language_export_data(
          project,
          export_config,
          language_no_connection,
          [],
          skip_timestamp: true
        )

      expect(language_child_data[:other]).to eq(language_parent_data[:other])

      expect(language_no_connection_data[key1.name][:other]).to eq('')

      expect(language_child_data).to match_snapshot('export_spec_language_with_parent_child_data')
      expect(language_parent_data).to match_snapshot('export_spec_language_with_parent_parent_data')
      expect(language_no_connection_data).to match_snapshot('export_spec_language_with_parent_no_connection_data')
    end
  end
end
