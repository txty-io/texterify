require_relative '../lib/texterify'

class Translation < ApplicationRecord
  has_paper_trail

  default_scope { order(created_at: :desc) }

  belongs_to :key
  belongs_to :language
  belongs_to :export_config, optional: true

  def auto_translate_untranslated
    if ENV['DEEPL_API_TOKEN'].present? && key.project.machine_translation_enabled && key.project.auto_translate_new_keys && !key.html_enabled
      key.project.languages.where(is_default: false).each do |target_language|
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
end
