require 'texterify'

RSpec.describe Texterify::ExportFormats::Csv do
  describe 'exports translations as CSV' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'csv')
      export_config.file_path = 'my_file_path'
      export_config
    end

    before(:each) do
      language_code = LanguageCode.find_by(code: 'de')
      country_code = CountryCode.find_by(code: 'AT')

      @project = create(:project, :with_organization)
      @project.save!

      @language = Language.new
      @language.language_code = language_code
      @language.country_code = country_code
      @language.name = 'language_name'
      @language.project_id = @project.id
      @language.save!
    end

    it 'creates files' do
      files =
        Texterify::ExportFormats::Csv.files(
          export_config,
          @language,
          {
            'a' => Texterify::ExportFormats::Helpers.export_data_value('b'),
            'c' => Texterify::ExportFormats::Helpers.export_data_value('d'),
            'c.a' => Texterify::ExportFormats::Helpers.export_data_value('e')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('csv_export')
    end

    it 'creates files with plural translations' do
      files =
        Texterify::ExportFormats::Csv.files(
          export_config,
          @language,
          {
            'a' => Texterify::ExportFormats::Helpers.export_data_value('b', pluralization_enabled: true),
            'c' => Texterify::ExportFormats::Helpers.export_data_value('d'),
            'c.a' => Texterify::ExportFormats::Helpers.export_data_value('e', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('csv_export_with_plural_translations')
    end

    it 'creates files but skips empty plural translations' do
      files =
        Texterify::ExportFormats::Csv.files(
          export_config,
          @language,
          {
            'a' =>
              Texterify::ExportFormats::Helpers.export_data_value('', pluralization_enabled: true, empty_plurals: true),
            'c' => Texterify::ExportFormats::Helpers.export_data_value('', empty_plurals: true),
            'c.a' =>
              Texterify::ExportFormats::Helpers.export_data_value('e', pluralization_enabled: true, empty_plurals: true)
          },
          skip_empty_plural_translations: true
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('csv_export_skip_empty_plural_translations')
    end
  end
end
