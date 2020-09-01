class ExportConfig < ApplicationRecord
  include ExportHelper

  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, presence: true
  validates :file_path, presence: true
  validates :file_format, presence: true
  validate :no_duplicate_export_configs_for_project

  belongs_to :project
  has_many :translations, dependent: :destroy
  has_many :post_processing_rules, dependent: :destroy
  has_many :language_configs, dependent: :destroy

  def name=(name)
    self[:name] = name.strip
  end

  def file_path=(file_path)
    self[:file_path] = file_path.strip
  end

  def file_format=(file_format)
    self[:file_format] = file_format.strip
  end

  def filled_file_path(language)
    path = file_path

    if language.is_default && default_language_file_path.present?
      path = default_language_file_path
    end

    language_config_code = language_configs.find_by(language_id: language.id)

    # Use the language code from the language config if available.
    if language_config_code
      path = path.sub('{languageCode}', language_config_code.language_code)
    elsif language.language_code
      path = path.sub('{languageCode}', language.language_code.code)
    else
      path
    end

    if language.country_code
      path.sub('{countryCode}', language.country_code.code)
    else
      path
    end
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

  # Validates that there are no export configs with the same name for a project.
  def no_duplicate_export_configs_for_project
    project = Project.find(project_id)
    export_config = project.export_configs.find_by(name: name)

    if export_config.present?
      updating_export_config = export_config.id == id

      errors.add(:name, :taken) if !updating_export_config
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
          # Replace ' with \' but don't escape \' again.
          xml.string value.gsub(/(?<!\\)'/, "\\\\'"), name: key
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
    export_data.each do |key, value|
      # Replace " with \" but don't escape \" again.
      escaped_value = value.gsub(/(?<!\\)"/, '\\"')
      language_file.puts('"' + key.to_s + '" = "' + escaped_value + '";')
    end
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
