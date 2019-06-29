require 'json'
require 'nokogiri'
require 'yaml'

module ExportHelper
  def json(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
    language_file.puts(JSON.pretty_generate(export_data))
    language_file.close

    language_file
  end

  def typescript(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
    language_file.puts('// tslint:disable')
    language_file.puts
    language_file.print("const #{language.name.downcase} = ")
    language_file.puts(JSON.pretty_generate(export_data) + ';')
    language_file.puts
    language_file.puts("export { #{language.name.downcase} };")
    language_file.close

    language_file
  end

  def android(language, export_data)
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.resources do
        export_data.each do |key, value|
          xml.string value, name: key
        end
      end
    end

    language_file = Tempfile.new(language.id.to_s)
    language_file.puts(builder.to_xml)
    language_file.close

    language_file
  end

  def ios(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
    export_data.each { |key, value| language_file.puts('"' + key.to_s + '" = "' + value.to_s + '";') }
    language_file.close

    language_file
  end

  def rails(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
    data = {}
    data[language[:name]] = export_data
    yaml = YAML.dump(data)
    language_file.puts(yaml)
    language_file.close

    language_file
  end
end
