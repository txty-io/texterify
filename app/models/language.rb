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
    if (ENV['DEEPL_API_TOKEN'].present? || Rails.env.test?) && self.project.machine_translation_enabled &&
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

  protected

  def strip_leading_and_trailing_whitespace
    self.name = name.strip
  end
end
