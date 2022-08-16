# Convert old HTML translations to their string representation.
def convert_old_html_translation(content)
  if content.nil?
    return nil
  end

  json_content = JSON.parse(content)

  if json_content.is_a?(Numeric)
    return json_content
  end

  converted = ''
  json_content['blocks']&.map do |block|
    if block['type'] == 'list'
      if block['data']['style'] == 'ordered'
        converted += '<ol>'
      elsif block['data']['style'] == 'unordered'
        converted += '<ul>'
      end

      block['data']['items'].map { |item| converted += "<li>#{item}</li>" }

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
  content
end

class ConvertOldHtmlTranslationsToPlainHtml < ActiveRecord::Migration[6.1]
  def change
    translations =
      Translation.all.joins('INNER JOIN keys k ON k.id = translations.key_id').where(k: { html_enabled: true })
    translations.each do |translation|
      translation.content = convert_old_html_translation(translation.content)
      translation.save!
    end

    Project.all.each { |project| project.recalculate_words_and_characters_count! }
  end
end
