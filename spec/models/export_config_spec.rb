require 'rails_helper'
require 'securerandom'

RSpec.describe ExportConfig, type: :model do
  def export_data_value(text, pluralization_enabled: false, empty_plurals: false)
    {
      other: text,
      zero: empty_plurals ? '' : 'zero text',
      one: empty_plurals ? '' : 'one text',
      two: empty_plurals ? '' : 'two text',
      few: empty_plurals ? '' : 'few text',
      many: empty_plurals ? '' : 'many text',
      pluralization_enabled: pluralization_enabled,
      description: 'description text'
    }
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

    language_code_source = LanguageCode.find_by(code: 'en')
    country_code_source = CountryCode.find_by(code: 'US')

    @language_source = Language.new
    @language_source.project_id = @project.id
    @language_source.language_code = language_code_source
    @language_source.country_code = country_code_source
    @language_source.name = 'language_source_name'
    @language_source.save!
  end

  context 'when exporting' do
    it 'returns the latest release' do
      export_config = ExportConfig.new
      export_config.name = 'export config name'
      export_config.file_format = FileFormat.find_by!(format: 'json')
      export_config.file_path = 'my_file_path'
      export_config.project_id = @project.id
      export_config.save!

      expect(export_config.latest_release).to be_nil

      release1 = Release.new
      release1.export_config = export_config
      release1.version = 1
      release1.timestamp = Time.now.utc
      release1.save!

      expect(export_config.latest_release.id).to eq(release1.id)

      release2 = Release.new
      release2.export_config = export_config
      release2.version = 3
      release2.timestamp = Time.now.utc
      release2.save!

      expect(export_config.latest_release.id).to eq(release2.id)

      release3 = Release.new
      release3.export_config = export_config
      release3.version = 2
      release3.timestamp = Time.now.utc
      release3.save!

      expect(export_config.latest_release.id).to eq(release2.id)
    end

    it 'exports without language and country code' do
      export_config = ExportConfig.new
      export_config.name = 'export config name'
      export_config.file_format = FileFormat.find_by!(format: 'json')
      export_config.file_path = 'my_file_path'
      export_config.project_id = @project.id
      export_config.save!

      @language.language_code = nil
      @language.country_code = nil

      files = export_config.files(@language, { "a": export_data_value('b') })
      expect(files[0][:path]).to eq('my_file_path')
    end

    it 'replaces correctly {languageCode} and {countryCode}' do
      export_config = ExportConfig.new
      export_config.name = 'export config name'
      export_config.file_format = FileFormat.find_by!(format: 'json')
      export_config.file_path = 'my_file_path'
      export_config.file_path = '{languageCode}-{countryCode}'
      export_config.project_id = @project.id
      export_config.save!

      files = export_config.files(@language, { "a": export_data_value('b') })
      expect(files[0][:path]).to eq('de-AT')
    end

    it 'replaces correctly {languageCode} and {countryCode} with language config' do
      export_config = ExportConfig.new
      export_config.name = 'export config name'
      export_config.file_format = FileFormat.find_by!(format: 'json')
      export_config.file_path = 'my_file_path'
      export_config.file_path = '{languageCode}-{countryCode}'
      export_config.project_id = @project.id
      export_config.save!

      language_config = LanguageConfig.new
      language_config.language_code = 'en'
      language_config.language_id = @language.id
      language_config.export_config_id = export_config.id
      language_config.save!

      files = export_config.files(@language, { "a": export_data_value('b') })
      expect(files[0][:path]).to eq('en-AT')
    end
  end

  # Android
  context 'when file format is android' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'android')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create android file content from parsed data' do
      files =
        export_config.files(
          @language,
          { "a": export_data_value('b'), "c": export_data_value('d'), "e": export_data_value('f') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_android_file_content')
    end

    it 'create pluralization android file content from parsed data' do
      files =
        export_config.files(
          @language,
          {
            "a": export_data_value('b', pluralization_enabled: true),
            "c": export_data_value('d'),
            "e": export_data_value('f', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_android_file_content_plural')
    end

    it 'creates android content but skips empty plural translations' do
      files =
        export_config.files(
          @language,
          {
            'a': export_data_value('', pluralization_enabled: true, empty_plurals: true),
            'c': export_data_value('', empty_plurals: true),
            'c.a': export_data_value('e', pluralization_enabled: true, empty_plurals: true)
          },
          skip_empty_plural_translations: true
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('android_export_skip_empty_plural_translations')
    end

    it 'escapes a single quote for android' do
      files = export_config.files(@language, { "x": export_data_value("'") })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'</string>\n</resources>\n"
      )
    end

    it 'escapes two single quotes for android' do
      files = export_config.files(@language, { "x": export_data_value("''") })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'\\'</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped single quote for android' do
      files = export_config.files(@language, { "x": export_data_value("'") })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'</string>\n</resources>\n"
      )
    end

    it 'escapes a double quote for android' do
      files = export_config.files(@language, { "x": export_data_value('"') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"</string>\n</resources>\n"
      )
    end

    it 'escapes two double quotes for android' do
      files = export_config.files(@language, { "x": export_data_value('""') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"\\\"</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped double quote for android' do
      files = export_config.files(@language, { "x": export_data_value('\"') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"</string>\n</resources>\n"
      )
    end

    it 'escapes a ? for android' do
      files = export_config.files(@language, { "x": export_data_value('?') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?</string>\n</resources>\n"
      )
    end

    it 'escapes two ? for android' do
      files = export_config.files(@language, { "x": export_data_value('??') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?\\?</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped ? for android' do
      files = export_config.files(@language, { "x": export_data_value('\?') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?</string>\n</resources>\n"
      )
    end

    it 'escapes a @ for android' do
      files = export_config.files(@language, { "x": export_data_value('@') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@</string>\n</resources>\n"
      )
    end

    it 'escapes two @ for android' do
      files = export_config.files(@language, { "x": export_data_value('@@') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@\\@</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped @ for android' do
      files = export_config.files(@language, { "x": export_data_value('\@') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@</string>\n</resources>\n"
      )
    end

    it 'escapes a & for android' do
      files = export_config.files(@language, { "x": export_data_value('&') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;</string>\n</resources>\n"
      )
    end

    it 'escapes two && for android' do
      files = export_config.files(@language, { "x": export_data_value('&&') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;&amp;</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped & for android' do
      files = export_config.files(@language, { "x": export_data_value('&&amp;') })
      files[0][:file].open
      expect(files[0][:file].read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;&amp;</string>\n</resources>\n"
      )
    end
  end

  # XLIFF
  context 'when file format is xliff' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'xliff')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create xliff file content from parsed data' do
      files =
        export_config.files(
          @language,
          { 'a' => export_data_value('b'), '_' => export_data_value('!') },
          @language_source,
          { 'a' => export_data_value('a'), '_' => export_data_value('_') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_xliff_file_content')
    end

    it 'create xliff file with empty target data' do
      files =
        export_config.files(
          @language,
          {},
          @language_source,
          { 'a' => export_data_value('a'), '_' => export_data_value('_') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_xliff_file_content_empty_target_data')
    end

    it 'create xliff file without source data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), '_' => export_data_value('!') }, nil, nil)
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_xliff_file_content_without_source_data')
    end
  end

  # ARB
  context 'when file format is arb' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'arb')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create arb file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), '_' => export_data_value('!') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_arb_file_content')
    end
  end

  # TypeScript
  context 'when file format is typescript' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'typescript')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create typescript file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_typescript_file_content')
    end

    it 'create typescript file content from parsed data plural' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('b', pluralization_enabled: true),
            'c' => export_data_value('d'),
            'e' => export_data_value('f', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_typescript_file_content_plural')
    end
  end

  # iOS
  context 'when file format is ios' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'ios')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create ios file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_ios_file_content')
    end

    it 'create ios file content with plurals from parsed data' do
      files =
        export_config.files(
          @language,
          {
            'non_plural_key_on' => export_data_value('other content 1'),
            'non_plural_key_two' => export_data_value('other content 2'),
            'plural_key_one' => export_data_value('other content 3', pluralization_enabled: true),
            'plural_key_two' => export_data_value('other content 4', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      files[1][:file].open
      expect(files[0][:path]).to eq('my_file_path')
      expect(files[1][:path]).to eq('my_file_path')
      expect(files[0][:file].read).to match_snapshot('create_ios_file_content_plural_strings')
      expect(files[1][:file].read).to match_snapshot('create_ios_file_content_plural_stringsdict')
    end

    it 'create ios file content with plurals from parsed data but skips empty plural translations' do
      files =
        export_config.files(
          @language,
          {
            'non_plural_key_on' => export_data_value('other content 1'),
            'non_plural_key_two' => export_data_value('other content 2'),
            'plural_key_one' => export_data_value('other content 3', pluralization_enabled: true, empty_plurals: true),
            'plural_key_two' => export_data_value('other content 4', pluralization_enabled: true)
          },
          skip_empty_plural_translations: true
        )
      files[0][:file].open
      files[1][:file].open
      expect(files[0][:path]).to eq('my_file_path')
      expect(files[1][:path]).to eq('my_file_path')
      expect(files[0][:file].read).to match_snapshot('create_ios_file_content_plural_strings_skip_empty_plurals')
      expect(files[1][:file].read).to match_snapshot('create_ios_file_content_plural_stringsdict_skip_empty_plurals')
    end

    it 'create ios file content with plurals from parsed data with custom paths' do
      export_config.file_path_stringsdict = 'my_file_path_stringsdict'
      export_config.default_language_file_path_stringsdict = 'my_file_path_stringsdict_default'
      files =
        export_config.files(
          @language,
          {
            'non_plural_key_on' => export_data_value('other content 1'),
            'non_plural_key_two' => export_data_value('other content 2'),
            'plural_key_one' => export_data_value('other content 3', pluralization_enabled: true),
            'plural_key_two' => export_data_value('other content 4', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      files[1][:file].open
      expect(files[0][:path]).to eq('my_file_path')
      expect(files[1][:path]).to eq('my_file_path_stringsdict')
    end

    it 'create ios file content with plurals from parsed data with custom paths for defautl language' do
      export_config.default_language_file_path_stringsdict = 'my_file_path_stringsdict_default'

      @language.is_default = true

      files =
        export_config.files(
          @language,
          {
            'non_plural_key_on' => export_data_value('other content 1'),
            'non_plural_key_two' => export_data_value('other content 2'),
            'plural_key_one' => export_data_value('other content 3', pluralization_enabled: true),
            'plural_key_two' => export_data_value('other content 4', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      files[1][:file].open
      expect(files[0][:path]).to eq('my_file_path')
      expect(files[1][:path]).to eq('my_file_path_stringsdict_default')
    end
  end

  # YAML
  context 'when file format is yaml' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'yaml')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create yaml file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_yaml_file_content')
    end

    it 'create yaml file content from plural data' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('b', pluralization_enabled: true),
            'c' => export_data_value('d', pluralization_enabled: true),
            'c.a' => export_data_value('e')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_yaml_file_content_plural')
    end
  end

  # Rails
  context 'when file format is rails' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'rails')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create rails file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_rails_file_content')
    end
  end

  # TOML
  context 'when file format is toml' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'toml')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create toml file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_toml_file_content')
    end

    it 'create toml file content from plural data' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('b', pluralization_enabled: true),
            'c' => export_data_value('d', pluralization_enabled: true),
            'c.a' => export_data_value('e')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_toml_file_content_plural')
    end
  end

  # Properties
  context 'when file format is properties' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'properties')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create properties file content from parsed data' do
      files = export_config.files(@language, { "a": export_data_value('b'), "_": export_data_value('!') })
      files[0][:file].open
      expect(files[0][:file].read).to eq("a=b\n_=!\n")
    end

    it 'create properties file content from plural data' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('b', pluralization_enabled: true),
            'c' => export_data_value('d', pluralization_enabled: true),
            'c.a' => export_data_value('e')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_properties_file_content_plural')
    end
  end

  # PO
  context 'when file format is po' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'po')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create po file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_po_file_content')
    end
  end

  # JSON
  context 'when file format is JSON' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'json')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create JSON file content from parsed data' do
      files =
        export_config.files(
          @language,
          { 'a' => export_data_value('b'), 'c' => export_data_value('d'), 'c.a' => export_data_value('e') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('json_export_simple')
    end

    it 'create JSON file content from parsed data plural' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('b', pluralization_enabled: true),
            'c' => export_data_value('d'),
            'c.a' => export_data_value('e', pluralization_enabled: true)
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('json_export_plural')
    end

    it 'creates JSON content but skips empty plural translations' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('', pluralization_enabled: true, empty_plurals: true),
            'c' => export_data_value('', empty_plurals: true),
            'c.a' => export_data_value('e', pluralization_enabled: true, empty_plurals: true)
          },
          skip_empty_plural_translations: true
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('json_export_skip_empty_plural_translations')
    end

    it 'create JSON file content from parsed data with split on .' do
      export_config.split_on = '.'
      files =
        export_config.files(
          @language,
          { 'a' => export_data_value('b'), 'c.a' => export_data_value('d'), 'c.b' => export_data_value('e') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('json_export_with_split_on')
    end

    it 'create JSON file content from parsed data with split on . with parent object key' do
      export_config.split_on = '.'
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('a value'),
            'c' => export_data_value('this is not in the export'),
            'c.a' => export_data_value('also not in export'),
            'c.a.a' => export_data_value('overwrites c and c.a value'),
            'c.b' => export_data_value('c.b value')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('json_export_with_split_on_parent_object_key_ignored_1')

      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('not in export'),
            'a.a.a' => export_data_value('also not in export'),
            'a.a' => export_data_value('overwrites a and a.a.a value')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('json_export_with_split_on_parent_object_key_ignored_2')
    end
  end

  # Format.js JSON
  context 'when file format is formatjs' do
    let(:export_config) do
      export_config = ExportConfig.new
      export_config.file_format = FileFormat.find_by!(format: 'json-formatjs')
      export_config.file_path = 'my_file_path'
      export_config
    end

    it 'create formatjs file content from parsed data' do
      files =
        export_config.files(
          @language,
          { 'a' => export_data_value('b'), 'c' => export_data_value('d'), 'c.a' => export_data_value('e') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('formatjs_json_export_simple')
    end

    it 'create formatjs file content from plural data' do
      files =
        export_config.files(
          @language,
          {
            'a' => export_data_value('b', pluralization_enabled: true),
            'c' => export_data_value('d', pluralization_enabled: true),
            'c.a' => export_data_value('e')
          }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('formatjs_json_export_plural')
    end
  end
end
