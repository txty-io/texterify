require 'rails_helper'
require 'securerandom'

RSpec.describe ExportConfig, type: :model do
  def export_data_value(text, pluralization_enabled: false)
    {
      other: text,
      zero: 'zero text',
      one: 'one text',
      two: 'two text',
      few: 'few text',
      many: 'many text',
      pluralization_enabled: pluralization_enabled,
      description: 'description text'
    }
  end

  before(:each) do
    language_code = LanguageCode.find_by(code: 'de')
    country_code = CountryCode.find_by(code: 'AT')

    @language = Language.new
    @language.language_code = language_code
    @language.country_code = country_code
    @language.id = SecureRandom.uuid
    @language.name = 'Language_name'

    language_code_source = LanguageCode.find_by(code: 'en')
    country_code_source = CountryCode.find_by(code: 'US')

    @language_source = Language.new
    @language_source.language_code = language_code_source
    @language_source.country_code = country_code_source
    @language_source.id = SecureRandom.uuid
  end

  # Android
  context 'when file format is android' do
    export_config = ExportConfig.new
    export_config.file_format = 'android'
    export_config.file_path = 'my_file_path'

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
      files = export_config.files(@language, { "x": export_data_value("\'") })
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
    export_config = ExportConfig.new
    export_config.file_format = 'xliff'
    export_config.file_path = 'my_file_path'

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
    export_config = ExportConfig.new
    export_config.file_format = 'arb'
    export_config.file_path = 'my_file_path'

    it 'create arb file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), '_' => export_data_value('!') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_arb_file_content')
    end
  end

  # TypeScript
  context 'when file format is typescript' do
    export_config = ExportConfig.new
    export_config.file_format = 'typescript'
    export_config.file_path = 'my_file_path'

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
    export_config = ExportConfig.new
    export_config.file_format = 'ios'
    export_config.file_path = 'my_file_path'

    it 'create ios file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_ios_file_content')
    end
  end

  # YAML
  context 'when file format is yaml' do
    export_config = ExportConfig.new
    export_config.file_format = 'yaml'
    export_config.file_path = 'my_file_path'

    it 'create yaml file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_yaml_file_content')
    end
  end

  # TOML
  context 'when file format is toml' do
    export_config = ExportConfig.new
    export_config.file_format = 'toml'
    export_config.file_path = 'my_file_path'

    it 'create toml file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_toml_file_content')
    end
  end

  # Properties
  context 'when file format is properties' do
    export_config = ExportConfig.new
    export_config.file_format = 'properties'
    export_config.file_path = 'my_file_path'

    it 'create properties file content from parsed data' do
      files = export_config.files(@language, { "a": export_data_value('b'), "_": export_data_value('!') })
      files[0][:file].open
      expect(files[0][:file].read).to eq("a=b\n_=!\n")
    end
  end

  # PO
  context 'when file format is po' do
    export_config = ExportConfig.new
    export_config.file_format = 'po'
    export_config.file_path = 'my_file_path'

    it 'create po file content from parsed data' do
      files = export_config.files(@language, { 'a' => export_data_value('b'), 'c' => export_data_value('d') })
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('create_po_file_content')
    end
  end

  # JSON
  context 'when file format is JSON' do
    export_config = ExportConfig.new
    export_config.file_format = 'json'
    export_config.file_path = 'my_file_path'

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
    export_config = ExportConfig.new
    export_config.file_format = 'json-formatjs'
    export_config.file_path = 'my_file_path'

    it 'create formatjs file content from parsed data' do
      files =
        export_config.files(
          @language,
          { 'a' => export_data_value('b'), 'c' => export_data_value('d'), 'c.a' => export_data_value('e') }
        )
      files[0][:file].open
      expect(files[0][:file].read).to match_snapshot('formatjs_json_export_simple')
    end
  end
end
