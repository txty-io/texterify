require 'json'
require 'nokogiri'
require 'yaml'
require 'toml-rb'
require 'java-properties'
require 'poparser'

# Texterify::Import
module Texterify
  class Import
    REGEX_CONTENT = /"((\\"|[^"])+)"/.freeze
    REGEX_KEY_VALUE = /#{REGEX_CONTENT}\s*=\s*#{REGEX_CONTENT}*/.freeze

    def self.parse_file_content(_file_name, file_content, file_format)
      # Force encoding due to error
      # "<Encoding::CompatibilityError: incompatible encoding regexp match (UTF-8 regexp with ASCII-8BIT string)>"
      # when importing TOML data.
      file_content.force_encoding(Encoding::UTF_8)

      if file_format == 'json-plurals'
        json?(file_content, false)
      elsif file_format == 'json'
        json?(file_content, true)
      elsif ['json-formatjs', 'json-poeditor'].include?(file_format)
        json?(file_content, false)
      elsif file_format == 'ios'
        strings?(file_content)
      elsif file_format == 'android'
        android?(file_content)
      elsif file_format == 'toml'
        toml?(file_content)
      elsif file_format == 'properties'
        properties?(file_content)
      elsif file_format == 'po'
        po?(file_content)
      elsif file_format == 'arb'
        arb?(file_content)
      elsif file_format == 'xliff'
        xliff?(file_content)
      elsif file_format == 'rails'
        yaml?(file_content, remove_root_keys: true)
      elsif file_format == 'yaml'
        yaml?(file_content)
      elsif file_format == 'stringsdict'
        stringsdict?(file_content)
      else
        raise Texterify::MachineTranslation::InvalidFileFormatException.new({ file_format: file_format })
      end
    end

    # Flattens a nested hash.
    def self.flatten_nested_keys(content, flattened_content = {}, name_prefix = '')
      content.each do |key, value|
        if name_prefix.blank?
          combined_name = key
        else
          combined_name = "#{name_prefix}.#{key}"
        end

        if value.is_a?(Hash)
          flatten_nested_keys(value, flattened_content, combined_name)
        else
          flattened_content[combined_name] = value
        end
      end

      return flattened_content
    end

    def self.json?(content, flatten)
      parsed = JSON.parse(content)

      if flatten
        parsed = flatten_nested_keys(parsed)
      end

      { success: true, content: parsed }
    rescue JSON::ParserError => e
      { success: false, error_message: e.message }
    end

    def self.arb?(content)
      parsed = JSON.parse(content)
      json = {}
      parsed.each do |key, value|
        if !key.start_with?('@@')
          # If entry key is not a global field.

          if key.start_with?('@')
            # If the entry is a meta object.
            key_name = key[1..]
            content = ''
            if json[key_name].present?
              content = json[key_name]
            end

            json[key_name] = { value: content, description: value['description'] }
          else
            # If the entry is just a normal translation key.
            json[key] = value
          end
        end
      end

      { success: true, content: json }
    rescue JSON::ParserError => e
      { success: false, error_message: e.message }
    end

    def self.properties?(content)
      parsed = JavaProperties.parse(content)

      { success: true, content: parsed }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end

    def self.xliff?(content)
      parsed = {}

      xml = Nokogiri.XML(content)

      # If there is at least one target element the target content will be imported.
      # Otherwise the source content will be used.
      import_target = !xml.css('target').empty?

      trans_units = xml.css('trans-unit')
      trans_units.map do |trans_unit|
        parsed[trans_unit['id']] = trans_unit.css(import_target ? 'target' : 'source').text
      end

      { success: true, content: parsed }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end

    def self.stringsdict?(content)
      parsed = {}

      xml = Nokogiri.XML(content)

      keys_content = xml.css('> plist > dict')

      keys_content.children.each do |element|
        key = element.name == 'key' ? element.children.text : nil

        if key.present?
          parsed[key] = {}

          # Get the dict element for the current key.
          dict_for_key = element.next_element

          # Get the element that contains the key/string translation pairs.
          content = dict_for_key.css('> dict')

          content_element_key = nil
          content.each do |content_element|
            key_strings = content_element.css('key, string')

            key_strings.each do |key_string|
              if key_string.name == 'key'
                content_element_key = key_string.text
              elsif key_string.name == 'string'
                if content_element_key == 'zero'
                  parsed[key][:zero] = key_string.text
                elsif content_element_key == 'one'
                  parsed[key][:one] = key_string.text
                elsif content_element_key == 'two'
                  parsed[key][:two] = key_string.text
                elsif content_element_key == 'few'
                  parsed[key][:few] = key_string.text
                elsif content_element_key == 'many'
                  parsed[key][:many] = key_string.text
                elsif content_element_key == 'other'
                  parsed[key][:other] = key_string.text
                end
              end
            end
          end
        end
      end

      { success: true, content: parsed }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end

    def self.yaml?(content, remove_root_keys: false)
      parsed = YAML.safe_load(content)

      if remove_root_keys
        modified = {}
        parsed.keys.each { |key| modified.merge!(parsed[key]) }
        parsed = modified
      end

      { success: true, content: flatten_nested_keys(parsed) }
    rescue Psych::SyntaxError, StandardError => e
      { success: false, error_message: e.message }
    end

    def self.po?(content)
      parsed =
        PoParser.parse(
          content.gsub!("\xEF\xBB\xBF".force_encoding('UTF-8'), '') # Remove BOM if present
        ).to_h
      json = {}

      parsed.each do |entry|
        if entry[:msgctxt]
          json[entry[:msgid]] = { value: entry[:msgstr], description: entry[:msgctxt] }
        else
          json[entry[:msgid]] = entry[:msgstr]
        end
      end

      { success: true, content: json }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end

    def self.strings?(content)
      json = {}
      content.each_line do |line|
        match = line.match(REGEX_KEY_VALUE)
        if match
          pair = match.to_s.partition(/\s*=\s*/)
          pair.map { |index| index.gsub!(/(^"|"$)/, '') }
          json[pair[0]] = pair[2]
        end
      end

      { success: true, content: json }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end

    def self.android?(content)
      parsed = {}

      xml = Nokogiri.XML(content)

      # <string name="xxx">
      string_elements = xml.css('resources string')
      string_elements.map { |string_element| parsed[string_element['name']] = string_element.text }

      # <plurals name="xxx">
      plurals_elements = xml.css('resources plurals')
      plurals_elements.map do |plural_element|
        parsed[plural_element['name']] = {
          other: plural_element.css("item[quantity='other']").text,
          zero: plural_element.css("item[quantity='zero']").text,
          one: plural_element.css("item[quantity='one']").text,
          two: plural_element.css("item[quantity='two']").text,
          few: plural_element.css("item[quantity='few']").text,
          many: plural_element.css("item[quantity='many']").text
        }
      end

      { success: true, content: parsed }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end

    def self.toml?(content)
      parsed = TomlRB.parse(content)

      keys = {}
      parsed.each do |k1, v1|
        # TOML sections are parsed as a hash (special handling for those sections).
        if v1.is_a?(Hash)
          v1.each do |k2, v2|
            if k2 == 'description'
              # The "description" field is imported as the description for the keys in this group so skip it.
              next
            elsif v1.key?('description')
              # If the TOML section contains a "description" field we use it as the description of the key.
              keys["#{k1}.#{k2}"] = { description: v1['description'], value: v2 }
            else
              # Otherwise import the key as a combination of the section name and the key name.
              keys["#{k1}.#{k2}"] = v2
            end
          end
        else
          keys[k1] = v1
        end
      end

      { success: true, content: keys }
    rescue StandardError => e
      { success: false, error_message: e.message }
    end
  end
end
