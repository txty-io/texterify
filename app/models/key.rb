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
  has_many :translations, dependent: :destroy

  validates :name, presence: true
  validate :no_duplicate_keys_for_project

  before_validation :strip_leading_and_trailing_whitespace
  before_validation :check_html_allowed

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

  def default_language
    project.languages.find_by(is_default: true)
  end

  def default_language_translation
    if default_language
      translations.find_by(language_id: default_language.id)
    end
  end

  protected

  def check_html_allowed
    if html_enabled_changed? && !project.feature_enabled?(Organization::FEATURE_HTML_EDITOR)
      self.html_enabled = false
    end
  end

  def strip_leading_and_trailing_whitespace
    self.name = name.strip
  end
end
