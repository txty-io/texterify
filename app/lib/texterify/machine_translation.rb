require 'deepl'

# Texterify::MachineTranslation
module Texterify
  class MachineTranslation
    # Texterify::MachineTranslation::OrganizationMachineTranslationUsageExceededException
    class OrganizationMachineTranslationUsageExceededException < StandardError
      attr_reader :details

      def initialize(details)
        @details = details
        super()
      end
    end

    # Returns nil if the translation couldn't be translated.
    # Otherwise returns the translated content.
    # @throws OrganizationMachineTranslationUsageExceededException
    def self.translate(project, source_translation, target_language)
      # Check if source and target language code are set.
      if source_translation.language.language_code.nil? || target_language.language_code.nil?
        return nil
      end

      # First check if the source translation has already
      # been translated in the target language.
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
        organization = project.organization
        character_count = source_translation.content.length

        # Check if the organization has exceeded their machine translation usage.
        if organization.exceeds_machine_translation_usage?(character_count)
          raise Texterify::MachineTranslation::OrganizationMachineTranslationUsageExceededException.new(
                  {
                    machine_translation_character_usage: organization.machine_translation_character_usage,
                    machine_translation_character_limit: organization.machine_translation_character_limit,
                    translation_character_count: character_count
                  }
                )
        else
          character_count = source_translation.content.length

          project.increment(:machine_translation_character_usage, character_count)
          organization.increment(:machine_translation_character_usage, character_count)

          project.save!
          organization.save!

          deepl_client = Deepl::Client.new(organization)

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
      end

      content
    end
  end
end
