class Key < ApplicationRecord
  has_paper_trail

  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  # Note: For HTML keys "contains" is always used because it is otherwise hard to find keys with HTML content at all.
  scope :match_name_or_description_or_translation_content,
        lambda { |search, eq_op, exactly|
          where(
            "(keys.name #{eq_op} :search or keys.description #{eq_op} :search or translations.content #{eq_op} :search) or (translations.content ilike :search_html and keys.html_enabled = true)",
            search: exactly ? sanitize_sql_like(search) : "%#{sanitize_sql_like(search)}%",
            search_html: "%#{sanitize_sql_like(search)}%"
          )
        }
  scope :distinct_on_lower_name, -> { select('distinct on (lower("keys"."name")) keys.*') }

  belongs_to :project
  has_many :wordpress_contents, dependent: :destroy
  has_many :translations, dependent: :destroy

  # A key has many tags attached.
  has_many :key_tags, dependent: :delete_all
  has_many :tags, through: :key_tags

  has_many :placeholders, dependent: :destroy

  validates :name, presence: true
  validate :no_duplicate_keys_for_project
  validate :no_reserved_key_names

  before_validation :strip_leading_and_trailing_whitespace
  before_validation :check_html_allowed

  def name_editable
    self.wordpress_contents.empty?
  end

  # Validates that there are no keys with same name for a project.
  def no_duplicate_keys_for_project
    project = Project.find(project_id)
    key = project.keys.find_by(name: name)

    if key.present?
      updating_key = key.id == id

      if !updating_key
        errors.add(:name, :taken)
      end
    end
  end

  # Checks if a key starts with the prefix "texterify_" which is reserved for special Texterify keys
  # like the "texterify_timestamp".
  def no_reserved_key_names
    if self.name&.start_with?('texterify_')
      errors.add(:name, :key_name_reserved)
    end
  end

  # Returns the default language if available.
  # Otherwise returns nil.
  def default_language
    self.project.languages.find_by(is_default: true)
  end

  # Returns the translation of the key for the default language.
  # Otherwise returns nil.
  def default_language_translation
    if self.default_language
      self.translations.find_by(language_id: self.default_language.id)
    end
  end

  # Returns all translations of the key except of the one for the default language.
  # If no default language is set returns all translations.
  def non_default_language_translations
    default_language ? translations.where.not(language_id: default_language.id) : translations
  end

  # Creates the tag in the project if it does not exist and
  # adds the tag to the key if it hasn't already been added.
  # Returns the new or already added tag.
  def add_tag_if_not_added(name, custom)
    tag = self.project.create_tag_if_not_exists(name, custom)

    key_has_tag = self.tags.exists?(id: tag.id)
    unless key_has_tag
      key_tag = KeyTag.new
      key_tag.tag = tag
      key_tag.key = self
      key_tag.save!
    end

    tag
  end

  # Rechecks all placeholders of the key and creates validation violations if
  # a placeholder in the source translation is missing in the other translations.
  def check_placeholders
    if self.default_language_translation.nil?
      return
    end

    # Check for all placeholders in the current default language translation.
    existing_placeholders = []
    self
      .default_language_translation
      .placeholder_names
      .each do |placeholder_name|
        placeholder = self.placeholders.find_by(name: placeholder_name)
        unless placeholder
          placeholder = Placeholder.new
          placeholder.name = placeholder_name
          placeholder.key = self
          placeholder.save!
        end

        existing_placeholders << placeholder
      end

    # Remove placeholders that are no longer available in the source translation.
    self.placeholders.where.not(id: existing_placeholders.map(&:id)).each(&:destroy)

    # Check if placeholders are used in other non-source translations.
    self.non_default_language_translations.each do |translation|
      translation_placeholders = translation.placeholder_names
      missing_placeholders = existing_placeholders.map(&:name) - translation_placeholders

      # Create validation errors for all missing placeholders.
      missing_placeholders.each do |missing_placeholder|
        ValidationViolation.find_or_create_by!(
          project_id: project.id,
          translation_id: translation.id,
          placeholder_id: self.placeholders.find_by(name: missing_placeholder).id
        )
      end

      # Remove placeholder issues that are now fixed.
      translation_placeholders.each do |translation_placeholder|
        placeholder = self.placeholders.find_by(name: translation_placeholder)

        if placeholder
          issue =
            ValidationViolation.find_by(
              project_id: project.id,
              translation_id: translation.id,
              placeholder_id: placeholder.id
            )

          issue&.destroy!
        end
      end
    end
  end

  # Returns the translation of the key for the given language and export config.
  def translation_for(language_id, export_config_id)
    key_translation_export_config =
      key
        .translations
        .where(language_id: language_id, export_config_id: export_config_id)
        .order(created_at: :desc)
        .first

    # If there is a export config translation use it.
    if key_translation_export_config&.content.present?
      key_translation = key_translation_export_config
    else
      # Otherwise use the default translation of the language.
      key_translation =
        key.translations.where(language_id: language.id, export_config_id: nil).order(created_at: :desc).first
    end

    key_translation
  end

  protected

  def check_html_allowed
    if html_enabled_changed? && !project.feature_enabled?(Organization::FEATURE_HTML_EDITOR)
      self.html_enabled = false
    end
  end

  # Removes the leading and trailing whitespace of the key name.
  def strip_leading_and_trailing_whitespace
    self.name = name.strip
  end
end
