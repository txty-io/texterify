require_relative './deepl'

module Texterify
  class MachineTranslation
    def self.translate(source_translation, target_language)
      machine_translation_memory =
        MachineTranslationMemory.find_by(
          from: source_translation.content,
          source_language_code_id: source_translation.language.language_code_id,
          target_language_code_id: target_language.language_code_id
        )

      content = nil
      if machine_translation_memory.present?
        content = machine_translation_memory.to
      else
        deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])

        deepl_translation =
          deepl_client.translate(
            source_translation.content,
            source_translation.language.language_code.code,
            target_language.language_code.code
          )

        if deepl_translation
          MachineTranslationMemory.create(
            from: source_translation.content,
            to: deepl_translation,
            source_language_code_id: source_translation.language.language_code_id,
            target_language_code_id: target_language.language_code_id
          )

          content = deepl_translation
        end
      end

      content
    end
  end
end
