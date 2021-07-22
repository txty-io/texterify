require_relative '../lib/texterify'

class Translation < ApplicationRecord
  has_paper_trail

  default_scope { order(created_at: :desc) }

  belongs_to :key
  belongs_to :language
  belongs_to :export_config, optional: true

  after_save :update_project_word_char_count

  def auto_translate_untranslated
    project = key.project

    if ENV['DEEPL_API_TOKEN'].present? && project.machine_translation_enabled && project.auto_translate_new_keys &&
         !key.html_enabled && project.feature_enabled?(:FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE)
      key
        .project
        .languages
        .where(is_default: false)
        .each do |target_language|
          source_translation = key.default_language_translation
          target_translation = key.translations.find_by(language_id: target_language.id, export_config_id: nil)

          if source_translation.present? && (target_translation.nil? || target_translation.content.empty?)
            content = Texterify::MachineTranslation.translate(source_translation, target_language)

            unless content.nil?
              if target_translation.nil?
                translation = Translation.new(content: content)
                translation.language = target_language
                translation.key = key
                translation.save!
              else
                target_translation.update(content: content)
              end
            end
          end
        end
    end
  end

  private

  # Updates the project character and word count after a translation is updated.
  # Translations for HTML keys and export configs are ignored.
  def update_project_word_char_count
    if !self.key.html_enabled && self.export_config_id.nil?
      old_character_count = paper_trail.previous_version&.content.present? ? paper_trail.previous_version.content.length : 0
      new_character_count = self.content.present? ? self.content.length : 0
      character_count_diff = new_character_count - old_character_count

      old_word_count = paper_trail.previous_version&.content.present? ? paper_trail.previous_version.content.split(' ').length : 0
      new_word_count = self.content.present? ? self.content.split(' ').length : 0
      word_count_diff = new_word_count - old_word_count

      project = key.project
      project.character_count += character_count_diff
      project.word_count += word_count_diff
      project.save!
    end
  end
end
