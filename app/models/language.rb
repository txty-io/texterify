require_relative '../lib/texterify'

class Language < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  belongs_to :project
  belongs_to :country_code, optional: true
  belongs_to :language_code, optional: true
  belongs_to :parent, class_name: 'Language', optional: true
  has_many :children, class_name: 'Language', foreign_key: 'parent_id', dependent: :nullify, inverse_of: :parent
  has_many :keys, through: :project
  has_many :translations, dependent: :destroy
  has_many :language_project_columns, dependent: :delete_all
  has_many :project_columns, through: :language_project_columns
  has_many :language_configs, dependent: :destroy

  validate :no_duplicate_languages_for_project
  validates :name, presence: true, format: { with: /\A[A-Za-z_][A-Za-z0-9_]*\z/ }
  validates :supports_plural_zero, presence: true
  validates :supports_plural_one, presence: true
  validates :supports_plural_two, presence: true
  validates :supports_plural_few, presence: true
  validates :supports_plural_many, presence: true

  before_validation :strip_leading_and_trailing_whitespace

  # Validates that there are no languages with the same name for a project.
  def no_duplicate_languages_for_project
    project = Project.find(project_id)
    language = project.languages.find_by(name: name)

    if language.present?
      updating_language = language.id == id

      if !updating_language
        errors.add(:name, :taken)
      end
    end
  end

  # Translates all non export config translations of all non HTML keys for the language which are empty using machine translation.
  # @throws OrganizationMachineTranslationUsageExceededException
  def translate_untranslated_using_machine_translation
    if (ENV.fetch('DEEPL_API_TOKEN', nil).present? || Rails.env.test?) && self.project.machine_translation_enabled &&
         project.feature_enabled?(:FEATURE_MACHINE_TRANSLATION_LANGUAGE)
      self
        .keys
        .where(html_enabled: false)
        .each do |key|
          target_language = self
          source_translation = key.default_language_translation
          target_translation = key.translations.find_by(language_id: target_language.id, export_config_id: nil)

          if source_translation.present? && (target_translation.nil? || target_translation.content.empty?)
            content = Texterify::MachineTranslation.translate(self.project, source_translation, target_language)

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

      return true
    end

    return false
  rescue StandardError
    return false
  end

  # IETF language tag - RFC 4646 standard
  # Returns a language tag if language or country code is set.
  # Otherwise returns nil.
  def language_tag
    tag = ''

    if language_code
      tag = language_code.code
    end

    if language_code && country_code
      tag += '-'
    end

    if country_code
      tag += country_code.code
    end

    tag.empty? ? nil : tag
  end

  def set_language_plural_support_from_language_code
    if self.language_code
      language_plural = LanguagePlural.find_by(code: self.language_code.code)
      if language_plural
        self.supports_plural_zero = language_plural.supports_plural_zero
        self.supports_plural_one = language_plural.supports_plural_one
        self.supports_plural_two = language_plural.supports_plural_two
        self.supports_plural_few = language_plural.supports_plural_few
        self.supports_plural_many = language_plural.supports_plural_many
      end
    end
  end

  protected

  def strip_leading_and_trailing_whitespace
    self.name = name&.strip
  end
end
