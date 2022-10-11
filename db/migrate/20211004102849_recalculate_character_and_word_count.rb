class RecalculateCharacterAndWordCount < ActiveRecord::Migration[6.1]
  def change
    Project.all.each do |project|
      character_count = 0
      word_count = 0

      project.translations.each do |translation|
        if translation.export_config_id.nil? && translation.content.present?
          content = translation.content

          if translation.key.html_enabled
            converted = ApplicationController.helpers.convert_html_translation(translation.content)
            unless converted.nil?
              content = converted
            end
          end

          character_count += translation.content.length
          word_count += translation.content.split.length
        end
      end

      project.character_count = character_count
      project.word_count = word_count
      project.save!
    end
  end
end
