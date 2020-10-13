require 'json'
require 'nokogiri'
require 'yaml'

module ImportHelper
  REGEX_CONTENT = /"((\\"|[^"])+)"/.freeze
  REGEX_KEY_VALUE = /#{REGEX_CONTENT}\s*=\s*#{REGEX_CONTENT}*/.freeze

  def json_file_content(file_name, file_content)
    file_extension = File.extname(file_name)

    if file_extension == '.json'
      result = json?(file_content)
      if result[:matches]
        return result[:content]
      elsif result[:invalid]
        raise 'INVALID_JSON'
      else
        raise 'NOTHING_IMPORTED'
      end
    end

    if file_extension == '.strings'
      result = strings?(file_content)
      if result[:matches]
        return result[:content]
      else
        raise 'NOTHING_IMPORTED'
      end
    end

    raise 'INVALID_FILE_EXTENSION'
  end

  def json?(content)
    parsed = JSON.parse(content)
    if parsed.count > 0
      { matches: true, content: parsed }
    else
      { matches: false }
    end
  rescue JSON::ParserError
    { matches: false, invalid: true }
  end

  def strings?(content)
    json = {}
    content.each_line do |line|
      match = line.match(REGEX_KEY_VALUE)
      if match
        pair = match.to_s.partition(/\s*=\s*/)
        pair.map do |index|
          index.gsub!(/(^"|"$)/, '')
        end
        json[pair[0]] = pair[2]
      end
    end

    if json.count == 0
      { matches: false }
    end

    { matches: true, content: json }
  end
end
