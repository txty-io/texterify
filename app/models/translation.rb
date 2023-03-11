require 'txty'

class Translation < ApplicationRecord
  has_paper_trail

  belongs_to :key
  belongs_to :language
  belongs_to :flavor, optional: true

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

    # Check forbidden words for issues.
    project.forbidden_words_lists.each do |forbidden_words_list|
      forbidden_words_list.forbidden_words.each do |forbidden_word|
        active_violation =
          ValidationViolation.find_by(
            project_id: project.id,
            translation_id: self.id,
            forbidden_word_id: forbidden_word.id
          )

        translation_fw_matches_language_code =
          forbidden_word.forbidden_words_list.language_code_id.nil? ||
            forbidden_word.forbidden_words_list.language_code_id == self.language.language_code_id

        translation_fw_matches_country_code =
          forbidden_word.forbidden_words_list.country_code_id.nil? ||
            forbidden_word.forbidden_words_list.country_code_id == self.language.country_code_id

        is_violation =
          self.content.present? && translation_fw_matches_language_code && translation_fw_matches_country_code &&
            self.content.downcase.split.include?(forbidden_word.content.downcase)

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

      if self.content&.starts_with?(' ')
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

      if self.content&.ends_with?(' ')
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

      if self.content&.include?('  ')
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

      if self.content&.include?('http://')
        if !violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, name: 'validate_https')
        end
      else
        violation&.destroy!
      end
    end
  end

  def auto_translate_untranslated(current_user)
    project = key.project

    if ENV.fetch('DEEPL_API_TOKEN', nil).present? && project.machine_translation_enabled &&
         project.auto_translate_new_keys && !key.html_enabled &&
         project.feature_enabled?(:FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE)
      key
        .project
        .languages
        .where(is_default: false)
        .each do |target_language|
          source_translation = key.default_language_translation
          target_translation = key.translations.find_by(language_id: target_language.id, flavor_id: nil)

          if source_translation.present? && (target_translation.nil? || target_translation.content.empty?)
            begin
              content = Txty::MachineTranslation.translate(project, source_translation, target_language)

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
            rescue Txty::MachineTranslation::OrganizationMachineTranslationUsageExceededException
              # ignored
            end
          end
        end

      project.enqueue_check_validations_job(current_user.id)
    end
  end

  # Returns a list of all placeholder names present in the current translation content.
  def placeholder_names
    if self.key.project.placeholder_start && self.key.project.placeholder_end
      # Escape the placeholder start and ending characters.
      escaped_placeholder_start = Regexp.escape(self.key.project.placeholder_start)
      escaped_placeholder_end = Regexp.escape(self.key.project.placeholder_end)

      names = self.content ? self.content.scan(/#{escaped_placeholder_start}(.*?)#{escaped_placeholder_end}/) : []
      names.map { |name| "#{self.key.project.placeholder_start}#{name[0]}#{self.key.project.placeholder_end}" }
    else
      []
    end
  end

  def to_export_data(key, post_processing_rules, emojify: false)
    other = self.content || ''
    zero = self.zero || ''
    one = self.one || ''
    two = self.two || ''
    few = self.few || ''
    many = self.many || ''

    post_processing_rules.each do |post_processing_rule|
      other = other.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
      zero = zero.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
      one = one.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
      two = two.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
      few = few.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
      many = many.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
    end

    if emojify
      other.gsub!(/[^\s]/, '❤️')
      zero.gsub!(/[^\s]/, '❤️')
      one.gsub!(/[^\s]/, '❤️')
      two.gsub!(/[^\s]/, '❤️')
      few.gsub!(/[^\s]/, '❤️')
      many.gsub!(/[^\s]/, '❤️')
    end

    {
      other: other,
      zero: zero,
      one: one,
      two: two,
      few: few,
      many: many,
      pluralization_enabled: key.pluralization_enabled,
      description: key.description || ''
    }
  end

  private

  # Updates the project character and word count after a translation is updated.
  # Translations for export configs are ignored.
  def update_project_word_char_count_on_update
    if self.flavor_id.nil? && self.saved_changes['content'].present?
      content_before = self.saved_changes['content'][0] || '' # if it is a new key content[0] is nil
      content_after = self.saved_changes['content'][1] || ''

      character_count_diff = content_after.length - content_before.length
      word_count_diff = content_after.split.length - content_before.split.length

      project = key.project
      project.character_count += character_count_diff
      project.word_count += word_count_diff
      project.save!
    end
  end

  # Updates the project character and word count after a translation is destroyed.
  # Translations for export configs are ignored.
  def update_project_word_char_count_on_destroy
    if self.flavor_id.nil?
      translation_content = self.content

      unless translation_content.nil?
        project = key.project
        project.character_count -= translation_content.length
        project.word_count -= translation_content.split.length
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
