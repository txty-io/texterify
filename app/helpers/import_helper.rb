require 'json'
require 'nokogiri'
require 'yaml'
require 'toml-rb'

module ImportHelper
  REGEX_CONTENT = /"((\\"|[^"])+)"/.freeze
  REGEX_KEY_VALUE = /#{REGEX_CONTENT}\s*=\s*#{REGEX_CONTENT}*/.freeze

  def parse_file_content(_file_name, file_content, file_format)
    if ['json', 'json-formatjs'].include?(file_format)
      result = json?(file_content)
      if result[:matches]
        return result[:content]
      elsif result[:invalid]
        raise 'INVALID_JSON'
      else
        raise 'NOTHING_IMPORTED'
      end
    elsif file_format == 'json-nested'
      result = json_nested?(file_content)
      if result[:matches]
        return result[:content]
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
    end

    raise 'INVALID_FILE_FORMAT'
  end

  def json?(content)
    parsed = JSON.parse(content)
    parsed.count > 0 ? { matches: true, content: parsed } : { matches: false }
  rescue JSON::ParserError
    { matches: false, invalid: true }
  end

  def json_nested?(content)
    parsed = JSON.parse(content)
    parsed.count > 0 ? { matches: true, content: parsed } : { matches: false }
  rescue JSON::ParserError
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
