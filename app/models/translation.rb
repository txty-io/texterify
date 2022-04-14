require_relative '../lib/texterify'

# TODO: Add special handling for HTML translation validations.
class Translation < ApplicationRecord
  has_paper_trail

  default_scope { order(created_at: :desc) }

  belongs_to :key
  belongs_to :language
  belongs_to :export_config, optional: true

  after_destroy :update_project_word_char_count_on_destroy
  after_save :update_project_word_char_count_on_update, :check_placeholders

  # Checks all enabled validations and creates violations if necessary.
  # If a validation is given only that validation is checked.
  # Note: The predefined validations are still run even when a validation is given.
  def check_validations(validation_to_check = nil)
    project = key.project

    # Check predefined validations
    check_leading_whitespace(project)
    check_trailing_whitespace(project)
    check_double_whitespace(project)
    check_https(project)

    if validation_to_check
      validations_to_check = [validation_to_check]
    else
      validations_to_check = project.validations.where(enabled: true)
    end

    # Check custom validations
    validations_to_check.each do |validation|
      active_violation =
        ValidationViolation.find_by(project_id: project.id, translation_id: self.id, validation_id: validation.id)

      matches = false
      if validation.match == 'contains'
        matches = self.content.include?(validation.content)
      elsif validation.match == 'equals'
        matches = self.content == validation.content
      end

      if matches
        if !active_violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, validation_id: validation.id)
        end
      else
        active_violation&.destroy!
      end
    end

    # Check forbidden words
    project.forbidden_words.each do |forbidden_word|
      active_violation =
        ValidationViolation.find_by(
          project_id: project.id,
          translation_id: self.id,
          forbidden_word_id: forbidden_word.id
        )

      translation_fw_matches_language =
        forbidden_word.forbidden_words_list.language_id.nil? ||
          forbidden_word.forbidden_words_list.language_id == self.language_id

      is_violation =
        self.content.present? && translation_fw_matches_language && self.content.include?(forbidden_word.content)

      if is_violation
        if !active_violation
          ValidationViolation.create!(
            project_id: project.id,
            translation_id: self.id,
            forbidden_word_id: forbidden_word.id
          )
        end
      else
        active_violation&.destroy!
      end
    end
  end

  # Checks if the translation starts with a whitespace.
  def check_leading_whitespace(project)
    if project.validate_leading_whitespace
      violation =
        ValidationViolation.find_by(
          project_id: project.id,
          translation_id: self.id,
          name: 'validate_leading_whitespace'
        )

      if self.content.starts_with?(' ')
        if !violation
          ValidationViolation.create!(
            project_id: project.id,
            translation_id: self.id,
            name: 'validate_leading_whitespace'
          )
        end
      else
        violation&.destroy!
      end
    end
  end

  # Checks if the translation ends with a whitespace.
  def check_trailing_whitespace(project)
    if project.validate_trailing_whitespace
      violation =
        ValidationViolation.find_by(
          project_id: project.id,
          translation_id: self.id,
          name: 'validate_trailing_whitespace'
        )

      if self.content.ends_with?(' ')
        if !violation
          ValidationViolation.create!(
            project_id: project.id,
            translation_id: self.id,
            name: 'validate_trailing_whitespace'
          )
        end
      else
        violation&.destroy!
      end
    end
  end

  # Checks if the translation contains a double whitespace.
  def check_double_whitespace(project)
    if project.validate_double_whitespace
      violation =
        ValidationViolation.find_by(project_id: project.id, translation_id: self.id, name: 'validate_double_whitespace')

      if self.content.include?('  ')
        if !violation
          ValidationViolation.create!(
            project_id: project.id,
            translation_id: self.id,
            name: 'validate_double_whitespace'
          )
        end
      else
        violation&.destroy!
      end
    end
  end

  # Checks if the translation contains the string "http://" which indicates an insecure link.
  def check_https(project)
    if project.validate_https
      violation = ValidationViolation.find_by(project_id: project.id, translation_id: self.id, name: 'validate_https')

      if self.content.include?('http://')
        if !violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, name: 'validate_https')
        end
      else
        violation&.destroy!
      end
    end
  end

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
            begin
              content = Texterify::MachineTranslation.translate(project, source_translation, target_language)

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
            rescue OrganizationMachineTranslationUsageExceededException
              # ignored
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

      unless translation_content.nil?
        project = key.project
        project.character_count -= translation_content.length
        project.word_count -= translation_content.split(' ').length
        project.save!
      end
    end
  end

  # Returns true if the translation is the translation for the default language.
  # Otherwise returns false.
  def default_language_translation?
    self.key.default_language ? self.language_id == self.key.default_language.id : false
  end

  # Checks the placeholders for the key of the translation.
  def check_placeholders
    self.key.check_placeholders
  end
end
