class ExportConfig < ApplicationRecord
  include ExportHelper

  validates :name, presence: true

  belongs_to :project

  def filled_file_path(language)
    # if language.is_default && default_language_path
    #   default_language_file_path.sub('languageCode', language.language_code.code)
    # else
    if language.language_code
      file_path.sub('{languageCode}', language.language_code.code)
    else
      file_path
    end
    # end
  end

  def file(language, export_data)
    if file_format == 'json'
      json(language, export_data)
    elsif file_format == 'typescript'
      typescript(language, export_data)
    elsif file_format == 'android'
      android(language, export_data)
    elsif file_format == 'ios'
      ios(language, export_data)
    elsif file_format == 'rails'
      rails(language, export_data)
    else
      json(language, export_data)
    end
  end

  private

  def json(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
    language_file.puts(JSON.pretty_generate(export_data))
    language_file.close

    language_file
  end

  def typescript(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
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
