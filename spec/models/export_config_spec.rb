require 'rails_helper'
require 'securerandom'

RSpec.describe ExportConfig, type: :model do
  before(:each) do
    @language = Language.new
    @language.id = SecureRandom.uuid
  end

  context 'when file format is android' do
    export_config = ExportConfig.new
    export_config.file_format = 'android'

    it 'escapes a single quote for android' do
      file = export_config.file(@language, { "x": "'" })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'</string>\n</resources>\n")
    end

    it 'escapes two single quotes for android' do
      file = export_config.file(@language, { "x": "''" })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'\\'</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped single quote for android' do
      file = export_config.file(@language, { "x": "\'" })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\'</string>\n</resources>\n")
    end

    it 'escapes a double quote for android' do
      file = export_config.file(@language, { "x": '"' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"</string>\n</resources>\n"
      )
    end

    it 'escapes two double quotes for android' do
      file = export_config.file(@language, { "x": '""' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"\\\"</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped double quote for android' do
      file = export_config.file(@language, { "x": '\"' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\\"</string>\n</resources>\n"
      )
    end

    it 'escapes a ? for android' do
      file = export_config.file(@language, { "x": '?' })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?</string>\n</resources>\n")
    end

    it 'escapes two ? for android' do
      file = export_config.file(@language, { "x": '??' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?\\?</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped ? for android' do
      file = export_config.file(@language, { "x": '\?' })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\?</string>\n</resources>\n")
    end

    it 'escapes a @ for android' do
      file = export_config.file(@language, { "x": '@' })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@</string>\n</resources>\n")
    end

    it 'escapes two @ for android' do
      file = export_config.file(@language, { "x": '@@' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@\\@</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped @ for android' do
      file = export_config.file(@language, { "x": '\@' })
      file.open
      expect(file.read).to eq("<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">\\@</string>\n</resources>\n")
    end

    it 'escapes a & for android' do
      file = export_config.file(@language, { "x": '&' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;</string>\n</resources>\n"
      )
    end

    it 'escapes two && for android' do
      file = export_config.file(@language, { "x": '&&' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;&amp;</string>\n</resources>\n"
      )
    end

    it 'does not escape already escaped & for android' do
      file = export_config.file(@language, { "x": '&&amp;' })
      file.open
      expect(file.read).to eq(
        "<?xml version=\"1.0\"?>\n<resources>\n  <string name=\"x\">&amp;&amp;</string>\n</resources>\n"
      )
    end
  end

  context 'when file format is properties' do
    export_config = ExportConfig.new
    export_config.file_format = 'properties'

    it 'create properties file content from parsed data' do
      file = export_config.file(@language, { "a": 'b', "_": '!' })
      file.open
      expect(file.read).to eq("a=b\n_=!\n")
    end
  end

  context 'when file format is JSON' do
    export_config = ExportConfig.new
    export_config.file_format = 'json'

    it 'create JSON file content from parsed data' do
      file = export_config.file(@language, { "a": 'b', "c": 'd', "c.a": 'e' })
      file.open
      expect(file.read).to match_snapshot('json_export_simple')
    end

    it 'create JSON file content from parsed data with split on .' do
      export_config.split_on = '.'
      file = export_config.file(@language, { "a": 'b', "c.a": 'd', "c.b": 'e' })
      file.open
      expect(file.read).to match_snapshot('json_export_with_split_on')
    end

    it 'create JSON file content from parsed data with split on . with parent object key' do
      export_config.split_on = '.'
      file =
        export_config.file(
          @language,
          {
            "a": 'a value',
            "c": 'this is not in the export',
            "c.a": 'also not in export',
            "c.a.a": 'overwrites c and c.a value',
            "c.b": 'c.b value'
          }
        )
      file.open
      expect(file.read).to match_snapshot('json_export_with_split_on_parent_object_key_ignored_1')

      file =
        export_config.file(
          @language,
          { "a": 'not in export', "a.a.a": 'also not in export', "a.a": 'overwrites a and a.a.a value' }
        )
      file.open
      expect(file.read).to match_snapshot('json_export_with_split_on_parent_object_key_ignored_2')
    end
  end
end
