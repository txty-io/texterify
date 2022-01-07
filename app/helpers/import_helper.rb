require 'json'
require 'nokogiri'
require 'yaml'
require 'toml-rb'
require 'java-properties'
require 'poparser'

module ImportHelper
  REGEX_CONTENT = /"((\\"|[^"])+)"/.freeze
  REGEX_KEY_VALUE = /#{REGEX_CONTENT}\s*=\s*#{REGEX_CONTENT}*/.freeze

  def parse_file_content(_file_name, file_content, file_format)
    if ['json', 'json-formatjs'].include?(file_format)
      result = json?(file_content)

      if result[:matches]
        # For normal JSON files without a special format
        # flatten the keys to support also nested JSON.
        if file_format == 'json'
          return flatten_nested_keys(result[:content])
        else
          return result[:content]
        end
      elsif result[:invalid]
        raise 'INVALID_JSON'
      else
        raise 'NOTHING_IMPORTED'
      end
    elsif file_format == 'ios'
      result = strings?(file_content)
      if result[:matches]
        return result[:content]
      else
        raise 'NOTHING_IMPORTED'
      end
    elsif file_format == 'toml'
      result = toml?(file_content)
      if result[:matches]
        return result[:content]
      else
        raise 'NOTHING_IMPORTED'
      end
    elsif file_format == 'properties'
      result = properties?(file_content)
      if result[:matches]
        return result[:content]
      else
        raise 'NOTHING_IMPORTED'
      end
    elsif file_format == 'po'
      result = po?(file_content)
      if result[:matches]
        return result[:content]
      else
        raise 'NOTHING_IMPORTED'
      end
    elsif file_format == 'arb'
      result = arb?(file_content)
      if result[:matches]
        return result[:content]
      else
        raise 'NOTHING_IMPORTED'
      end
    end

    raise 'INVALID_FILE_FORMAT'
  end

  # Flattens a nested hash.
  def flatten_nested_keys(content, flattened_content = {}, name_prefix = '')
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

  def json?(content)
    parsed = JSON.parse(content)
    parsed.count > 0 ? { matches: true, content: parsed } : { matches: false }
  rescue JSON::ParserError
    { matches: false, invalid: true }
  end

  def arb?(content)
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
    parsed.count > 0 ? { matches: true, content: json } : { matches: false }
  rescue JSON::ParserError
    { matches: false, invalid: true }
  end

  def properties?(content)
    parsed = JavaProperties.parse(content)
    parsed.count > 0 ? { matches: true, content: parsed } : { matches: false }
  rescue StandardError
    { matches: false, invalid: true }
  end

  def po?(content)
    parsed = PoParser.parse(content).to_h
    json = {}

    parsed.each do |entry|
      if entry[:msgctxt]
        json[entry[:msgid]] = { value: entry[:msgstr], description: entry[:msgctxt] }
      else
        json[entry[:msgid]] = entry[:msgstr]
      end
    end

    json.count > 0 ? { matches: true, content: json } : { matches: false }
  rescue StandardError
    { matches: false, invalid: true }
  end

  def strings?(content)
    json = {}
    content.each_line do |line|
      match = line.match(REGEX_KEY_VALUE)
      if match
        pair = match.to_s.partition(/\s*=\s*/)
        pair.map { |index| index.gsub!(/(^"|"$)/, '') }
        json[pair[0]] = pair[2]
      end
    end

    if json.count == 0
      { matches: false }
    end

    { matches: true, content: json }
  end

  def toml?(content)
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

    keys.count > 0 ? { matches: true, content: keys } : { matches: false }
  end
end
