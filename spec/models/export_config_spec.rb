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
end
