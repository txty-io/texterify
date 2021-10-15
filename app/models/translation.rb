require_relative '../lib/texterify'

class Translation < ApplicationRecord
  has_paper_trail

  default_scope { order(created_at: :desc) }

  belongs_to :key
  belongs_to :language
  belongs_to :export_config, optional: true

  after_destroy :update_project_word_char_count_on_destroy
  after_save :update_project_word_char_count_on_update, :check_placeholders

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

  # Returns a list of all placeholder names present in the current translation content.
  def placeholder_names
    # Escape the placeholder start and ending characters.
    escaped_placeholder_start = Regexp.escape(self.key.project.placeholder_start)
    escaped_placeholder_end = Regexp.escape(self.key.project.placeholder_end)

    names = self.content ? self.content.scan(/#{escaped_placeholder_start}(.*?)#{escaped_placeholder_end}/) : []
    names.map { |name| "#{self.key.project.placeholder_start}#{name[0]}#{self.key.project.placeholder_end}" }
  end

  private

  # Updates the project character and word count after a translation is updated.
  # Translations for export configs are ignored.
  def update_project_word_char_count_on_update
    if self.export_config_id.nil? && self.saved_changes['content'].present?
      content_before = self.saved_changes['content'][0] || '' # if it is a new key content[0] is nil
      content_after = self.saved_changes['content'][1]

      # Try to convert it to the translated HTML content.
      # If the function returns an empty string then use the content without conversion.
      content_before_converted = ApplicationController.helpers.convert_html_translation(content_before)
      content_after_converted = ApplicationController.helpers.convert_html_translation(content_after)

      content_before = content_before_converted.nil? ? content_before : content_before_converted.to_s
      content_after = content_after_converted.nil? ? content_after : content_after_converted.to_s

      character_count_diff = content_after.length - content_before.length
      word_count_diff = content_after.split(' ').length - content_before.split(' ').length

      project = key.project
      project.character_count += character_count_diff
      project.word_count += word_count_diff
      project.save!
    end
  end

  # Updates the project character and word count after a translation is destroyed.
  # Translations for export configs are ignored.
  def update_project_word_char_count_on_destroy
    if self.export_config_id.nil?
      translation_content_converted = ApplicationController.helpers.convert_html_translation(self.content)
      translation_content = translation_content_converted.nil? ? self.content : translation_content_converted.to_s

      project = key.project
      project.character_count -= translation_content.length
      project.word_count -= translation_content.split(' ').length
      project.save!
    end
  end

  # Returns true if the translation is the translation for the default language.
  # Otherwise returns false.
  def default_language_translation?
    self.key.default_language ? self.language_id == self.key.default_language.id : false
  end

  # Checks the placeholders for the key of the translation.
  def check_placeholders
    if self.default_language_translation?
      self.key.recheck_placeholders
    else
      # TODO: Check if validation errors have been fixed.
    end
  end
end
