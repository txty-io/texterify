require 'json'
require 'nokogiri'
require 'yaml'

module ExportHelper
  def convert_html_translation(content)
    json_content = JSON.parse(content)

    converted = ''
    json_content['blocks'].map do |block|
      if block['type'] == 'list'
        if block['data']['style'] == 'ordered'
          converted += '<ol>'
        elsif block['data']['style'] == 'unordered'
          converted += '<ul>'
        end

        block['data']['items'].map do |item|
          converted += "<li>#{item}</li>"
        end

        if block['data']['style'] == 'ordered'
          converted += '</ol>'
        elsif block['data']['style'] == 'unordered'
          converted += '</ul>'
        end
      elsif block['type'] == 'paragraph'
        converted += "<p>#{block['data']['text']}</p>"
      end
    end

    converted
  rescue JSON::ParserError
    ''
  end
end
