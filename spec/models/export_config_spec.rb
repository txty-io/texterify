require 'rails_helper'
require 'securerandom'

RSpec.describe ExportConfig, type: :model do
  include ExportHelper

  before(:each) do
    language_code = LanguageCode.find_by(code: 'de')
    country_code = CountryCode.find_by(code: 'AT')

    @language = Language.new
    @language.language_code = language_code
    @language.country_code = country_code
    @language.id = SecureRandom.uuid

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

    it 'escapes a single quote for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string("'") })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'</string>\n</resources>\n")
    end

    it 'escapes two single quotes for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string("''") })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'\\'</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped single quote for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string("\'") })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'</string>\n</resources>\n")
    end

    it 'escapes a double quote for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('"') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"</string>\n</resources>\n"
      )
    end

    it 'escapes two double quotes for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('""') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"\\\"</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped double quote for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('\"') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"</string>\n</resources>\n"
      )
    end

    it 'escapes a ? for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('?') })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?</string>\n</resources>\n")
    end

    it 'escapes two ? for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('??') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?\\?</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped ? for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('\?') })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?</string>\n</resources>\n")
    end

    it 'escapes a @ for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('@') })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@</string>\n</resources>\n")
    end

    it 'escapes two @ for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('@@') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@\\@</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped @ for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('\@') })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@</string>\n</resources>\n")
    end

    it 'escapes a & for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('&') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;</string>\n</resources>\n"
      )
    end

    it 'escapes two && for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('&&') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;&amp;</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped & for android' do
      file = export_config.file(@language, { "x": language_export_data_line_from_simple_string('&&amp;') })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;&amp;</string>\n</resources>\n"
      )
    end
  end

  # Properties
  context 'when file format is properties' do
    export_config = ExportConfig.new
    export_config.file_format = 'properties'

    it 'create properties file content from parsed data' do
      file =
        export_config.file(
          @language,
          {
            "a": language_export_data_line_from_simple_string('b'),
            "_": language_export_data_line_from_simple_string('!')
          }
        )
      file.open
      expect(file.read).to eq("a=b\n_=!\n")
    end
  end

  # XLIFF
  context 'when file format is xliff' do
    export_config = ExportConfig.new
    export_config.file_format = 'xliff'

    it 'create xliff file content from parsed data' do
      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('b'),
            '_' => language_export_data_line_from_simple_string('!')
          },
          @language_source,
          {
            'a' => language_export_data_line_from_simple_string('a'),
            '_' => language_export_data_line_from_simple_string('_')
          }
        )
      file.open
      expect(file.read).to match_snapshot('create_xliff_file_content')
    end

    it 'create xliff file with empty target data' do
      file =
        export_config.file(
          @language,
          {},
          @language_source,
          {
            'a' => language_export_data_line_from_simple_string('a'),
            '_' => language_export_data_line_from_simple_string('_')
          }
        )
      file.open
      expect(file.read).to match_snapshot('create_xliff_file_content_empty_target_data')
    end

    it 'create xliff file without source data' do
      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('b'),
            '_' => language_export_data_line_from_simple_string('!')
          },
          nil,
          nil
        )
      file.open
      expect(file.read).to match_snapshot('create_xliff_file_content_without_source_data')
    end
  end

  # ARB
  context 'when file format is arb' do
    export_config = ExportConfig.new
    export_config.file_format = 'arb'

    it 'create arb file content from parsed data' do
      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('b'),
            '_' => language_export_data_line_from_simple_string('!')
          }
        )
      file.open
      expect(file.read).to match_snapshot('create_arb_file_content')
    end
  end

  # JSON
  context 'when file format is JSON' do
    export_config = ExportConfig.new
    export_config.file_format = 'json'

    it 'create JSON file content from parsed data' do
      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('b'),
            'c' => language_export_data_line_from_simple_string('d'),
            'c.a' => language_export_data_line_from_simple_string('e')
          }
        )
      file.open
      expect(file.read).to match_snapshot('json_export_simple')
    end

    it 'create JSON file content from parsed data with split on .' do
      export_config.split_on = '.'
      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('b'),
            'c.a' => language_export_data_line_from_simple_string('d'),
            'c.b' => language_export_data_line_from_simple_string('e')
          }
        )
      file.open
      expect(file.read).to match_snapshot('json_export_with_split_on')
    end

    it 'create JSON file content from parsed data with split on . with parent object key' do
      export_config.split_on = '.'
      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('a value'),
            'c' => language_export_data_line_from_simple_string('this is not in the export'),
            'c.a' => language_export_data_line_from_simple_string('also not in export'),
            'c.a.a' => language_export_data_line_from_simple_string('overwrites c and c.a value'),
            'c.b' => language_export_data_line_from_simple_string('c.b value')
          }
        )
      file.open
      expect(file.read).to match_snapshot('json_export_with_split_on_parent_object_key_ignored_1')

      file =
        export_config.file(
          @language,
          {
            'a' => language_export_data_line_from_simple_string('not in export'),
            'a.a.a' => language_export_data_line_from_simple_string('also not in export'),
            'a.a' => language_export_data_line_from_simple_string('overwrites a and a.a.a value')
          }
        )
      file.open
      expect(file.read).to match_snapshot('json_export_with_split_on_parent_object_key_ignored_2')
    end
  end
end
