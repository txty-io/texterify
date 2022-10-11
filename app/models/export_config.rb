class AndroidTemplateData
  attr_accessor :data

  def initialize(data)
    @data = data
  end

  # Expose private binding() method.
  # rubocop:disable Naming/AccessorMethodName
  def get_binding
    binding
  end
  # rubocop:enable Naming/AccessorMethodName
end

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
  has_many :releases, dependent: :destroy

  def latest_release
    releases.order('version DESC').first
  end

  def name=(name)
    self[:name] = name.strip
  end

  def file_path=(file_path)
    self[:file_path] = file_path.strip
  end

  def file_format=(file_format)
    self[:file_format] = file_format.strip
  end

  def filled_file_path(language, path_for: nil)
    path_to_use = self.file_path
    path_to_use_default_langage = self.default_language_file_path

    if path_for == 'stringsdict'
      if self.file_path_stringsdict
        path_to_use = self.file_path_stringsdict
      end

      if self.default_language_file_path_stringsdict
        path_to_use_default_langage = self.default_language_file_path_stringsdict
      end
    end

    path = path_to_use

    if language.is_default && path_to_use_default_langage.present?
      path = path_to_use_default_langage
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

    language.country_code ? path.sub('{countryCode}', language.country_code.code) : path
  end

  def files(language, export_data, language_source = nil, export_data_source = nil)
    if file_format == 'json'
      json(language, export_data)
    elsif file_format == 'json-formatjs'
      json_formatjs(language, export_data)
    elsif file_format == 'typescript'
      typescript(language, export_data)
    elsif file_format == 'android'
      android(language, export_data)
    elsif file_format == 'ios'
      ios(language, export_data)
    elsif file_format == 'yaml'
      yaml(language, export_data)
    elsif file_format == 'rails'
      yaml(language, export_data, group_by_language_and_country_code: true)
    elsif file_format == 'toml'
      toml(language, export_data)
    elsif file_format == 'properties'
      properties(language, export_data)
    elsif file_format == 'po'
      po(language, export_data)
    elsif file_format == 'arb'
      arb(language, export_data)
    elsif file_format == 'xliff'
      xliff(language, export_data, language_source, export_data_source)
    end
  end

  # Validates that there are no export configs with the same name for a project.
  def no_duplicate_export_configs_for_project
    project = Project.find(project_id)
    export_config = project.export_configs.find_by(name: name)

    if export_config.present?
      updating_export_config = export_config.id == id

      if !updating_export_config
        errors.add(:name, :taken)
      end
    end
  end

  private

  # Sets the value to the hash at the specified path.
  def deep_set(hash, value, *keys)
    hash.default_proc = proc { |h, k| h[k] = Hash.new(&h.default_proc) }

    keys[0...-1].inject(hash) do |acc, h|
      current_val = acc.public_send(:[], h)

      if current_val.is_a?(String) || current_val.nil?
        acc[h] = {}
      else
        current_val
      end
    end.public_send(:[]=, keys.last, value)
  end

  def json(language, export_data)
    language_file = Tempfile.new(language.id.to_s)

    plural_data = {}
    export_data.each do |key, value|
      if value[:pluralization_enabled]
        plural_data[key] = {
          other: value[:other],
          zero: value[:zero],
          one: value[:one],
          two: value[:two],
          few: value[:few],
          many: value[:many]
        }
      else
        plural_data[key] = value[:other]
      end
    end

    final_data = plural_data

    # If the export config has a split_on specified split it.
    unless self.split_on.nil?
      final_data = {}
      plural_data.each do |key, value|
        splitted = key.split(self.split_on)
        deep_set(final_data, value, *splitted)
      end
    end

    language_file.puts(JSON.pretty_generate(final_data))
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def json_formatjs(language, export_data)
    language_file = Tempfile.new(language.id.to_s)

    data = {}
    export_data.each do |key, value|
      if value[:pluralization_enabled]
        data["#{key}.zero"] = { defaultMessage: value[:zero], description: value[:description] }
        data["#{key}.one"] = { defaultMessage: value[:one], description: value[:description] }
        data["#{key}.two"] = { defaultMessage: value[:two], description: value[:description] }
        data["#{key}.few"] = { defaultMessage: value[:few], description: value[:description] }
        data["#{key}.many"] = { defaultMessage: value[:many], description: value[:description] }
        data["#{key}.other"] = { defaultMessage: value[:other], description: value[:description] }
      else
        data[key] = { defaultMessage: value[:other], description: value[:description] }
      end
    end

    language_file.puts(JSON.pretty_generate(data))
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def arb(language, export_data)
    language_file = Tempfile.new(language.id.to_s)

    data = {}
    export_data.each do |key, value|
      data[key] = value[:other]
      data["@#{key}"] = { description: value[:description] }
    end

    language_file.puts(JSON.pretty_generate(data))
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def android_sanitize_string(text)
    text
      .gsub(/(?<!\\)'/, "\\\\'")
      .gsub(/(?<!\\)"/, '\\\\"')
      .gsub(/(?<!\\)@/, '\\\\@')
      .gsub(/(?<!\\)\?/, '\\\\?')
      .gsub(/&(?!amp;)/, '&amp;')
  end

  # Creates an export for the Android platform.
  # Plurals: https://developer.android.com/guide/topics/resources/string-resource#Plurals
  def android(language, export_data)
    template = ERB.new(File.read('app/views/templates/android.xml.erb'))
    sanitized_data =
      export_data.transform_values do |v|
        # https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes
        # & and < must be escaped manually if necessary.
        v[:other] = android_sanitize_string(v[:other])
        v[:zero] = android_sanitize_string(v[:zero])
        v[:one] = android_sanitize_string(v[:one])
        v[:two] = android_sanitize_string(v[:two])
        v[:few] = android_sanitize_string(v[:few])
        v[:many] = android_sanitize_string(v[:many])
        v
      end

    data = AndroidTemplateData.new(sanitized_data)
    output = template.result(data.get_binding)

    language_file = Tempfile.new(language.id.to_s)
    language_file.puts(output)
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def xliff(language, export_data, language_source = nil, export_data_source = nil)
    builder =
      Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.xliff version: '1.2', xmlns: 'urn:oasis:names:tc:xliff:document:1.2' do
          xml.file original: 'Texterify API',
                   "source-language": language_source&.language_tag,
                   "target-language": language.language_tag do
            xml.body do
              export_data.each do |key, value|
                xml.send 'trans-unit', id: key do
                  if language_source && export_data_source
                    xml.source { xml.text export_data_source[key][:other] }
                  end
                  xml.target { xml.text value[:other] }
                end
              end
            end
          end
        end
      end

    output = builder.to_xml

    language_file = Tempfile.new(language.id.to_s)
    language_file.puts(output)
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def typescript(language, export_data)
    plural_data = {}
    export_data.each do |key, value|
      if value[:pluralization_enabled]
        plural_data[key] = {
          other: value[:other],
          zero: value[:zero],
          one: value[:one],
          two: value[:two],
          few: value[:few],
          many: value[:many]
        }
      else
        plural_data[key] = value[:other]
      end
    end

    language_file = Tempfile.new(language.id.to_s)
    language_file.print("const #{language.name.downcase} = ")
    language_file.puts("#{JSON.pretty_generate(plural_data)};")
    language_file.puts
    language_file.puts("export { #{language.name.downcase} };")
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def ios(language, export_data)
    files = []

    plural_data = {}
    strings_file = Tempfile.new(language.id.to_s)
    export_data.each do |key, value|
      # Plural keys are handled differently in iOS via a .stringsdict file.
      if value[:pluralization_enabled]
        plural_data[key] = value
      else
        # Non-plural keys are exported as .strings file
        # Replace " with \" but don't escape \" again.
        escaped_value = value[:other].gsub(/(?<!\\)"/, '\\"')
        strings_file.puts("\"#{key}\" = \"#{escaped_value}\";")
      end
    end
    strings_file.close
    strings_file_path = self.filled_file_path(language)

    files << { path: strings_file_path, file: strings_file }

    # Handle plural keys if there are any available and create a .stringsdict file.
    if !plural_data.empty?
      stringsdict_file = Tempfile.new(language.id.to_s)
      builder =
        Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
          xml.doc.create_internal_subset(
            'plist',
            '-//Apple//DTD PLIST 1.0//EN',
            'http://www.apple.com/DTDs/PropertyList-1.0.dtd'
          )
          xml.plist version: '1.0' do
            xml.dict do
              plural_data.each do |key, value|
                xml.key { xml.text key }
                xml.dict do
                  xml.key { xml.text 'NSStringLocalizedFormatKey' }
                  xml.string { xml.text '%#@VARIABLE@' }
                  xml.key { xml.text 'VARIABLE' }
                  xml.dict do
                    xml.key { xml.text 'NSStringFormatSpecTypeKey' }
                    xml.string { xml.text 'NSStringPluralRuleType' }
                    xml.key { xml.text 'NSStringFormatValueTypeKey' }
                    xml.string { xml.text 'd' }
                    xml.key { xml.text 'zero' }
                    xml.string { xml.text value[:zero] }
                    xml.key { xml.text 'one' }
                    xml.string { xml.text value[:one] }
                    xml.key { xml.text 'two' }
                    xml.string { xml.text value[:two] }
                    xml.key { xml.text 'few' }
                    xml.string { xml.text value[:few] }
                    xml.key { xml.text 'many' }
                    xml.string { xml.text value[:many] }
                    xml.key { xml.text 'other' }
                    xml.string { xml.text value[:other] }
                  end
                end
              end
            end
          end
        end

      stringsdict_file.puts(builder.to_xml)
      stringsdict_file.close
      stringsdict_file_path = self.filled_file_path(language, path_for: 'stringsdict')

      files << { path: stringsdict_file_path, file: stringsdict_file }
    end

    files
  end

  def yaml(language, export_data, group_by_language_and_country_code: false)
    converted_data = {}
    export_data.each do |key, value|
      if value[:pluralization_enabled]
        converted_data[key] = {
          zero: value[:zero],
          one: value[:one],
          two: value[:two],
          few: value[:few],
          many: value[:many],
          other: value[:other]
        }
      else
        converted_data[key] = value[:other]
      end
    end

    language_file = Tempfile.new(language.id.to_s)
    data = {}

    if group_by_language_and_country_code
      data[language.language_tag] = converted_data
    else
      data = converted_data
    end

    yaml = YAML.dump(data.deep_stringify_keys)
    language_file.puts(yaml)
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def toml(language, export_data)
    converted_data = {}
    export_data.each do |key, value|
      if value[:pluralization_enabled]
        converted_data["#{key}.zero"] = value[:zero]
        converted_data["#{key}.one"] = value[:one]
        converted_data["#{key}.two"] = value[:two]
        converted_data["#{key}.few"] = value[:few]
        converted_data["#{key}.many"] = value[:many]
        converted_data["#{key}.other"] = value[:other]
      else
        converted_data[key] = value[:other]
      end
    end

    language_file = Tempfile.new(language.id.to_s)
    toml = TomlRB.dump(converted_data)
    language_file.puts(toml)
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def properties(language, export_data)
    converted_data = {}
    export_data.each do |key, value|
      if value[:pluralization_enabled]
        converted_data["#{key}.zero"] = value[:zero]
        converted_data["#{key}.one"] = value[:one]
        converted_data["#{key}.two"] = value[:two]
        converted_data["#{key}.few"] = value[:few]
        converted_data["#{key}.many"] = value[:many]
        converted_data["#{key}.other"] = value[:other]
      else
        converted_data[key] = value[:other]
      end
    end

    language_file = Tempfile.new(language.id.to_s)
    properties = JavaProperties.generate(converted_data)
    language_file.puts(properties)
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end

  def po(language, export_data)
    language_file = Tempfile.new(language.id.to_s)
    po = PoParser.parse_file(language_file)
    po_data = export_data.map { |k, v| { msgid: k, msgstr: v[:other] } }
    po << po_data
    language_file.puts(po)
    language_file.close

    [{ path: self.filled_file_path(language), file: language_file }]
  end
end
