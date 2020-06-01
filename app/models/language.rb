class Language < ApplicationRecord
  default_scope { order(arel_table['name'].lower.asc) }

  belongs_to :project
  belongs_to :country_code, optional: true
  belongs_to :language_code, optional: true
  belongs_to :parent, class_name: 'Language', optional: true
  has_many :children, class_name: 'Language', foreign_key: 'parent_id', dependent: :nullify, inverse_of: :parent
  has_many :keys, through: :project
  has_many :translations, dependent: :destroy
  has_many :language_project_columns, dependent: :delete_all
  has_many :project_columns, through: :language_project_columns

  validate :no_duplicate_languages_for_project
  validates :name, presence: true, format: { with: /\A[A-Za-z_][A-Za-z0-9_]*\z/ }

  before_validation :strip_leading_and_trailing_whitespace

  # Validates that there are no languages with the same name for a project.
  def no_duplicate_languages_for_project
    project = Project.find(project_id)
    language = project.languages.find_by(name: name)

    if language.present?
      updating_language = language.id == id

      errors.add(:name, :taken) if !updating_language
    end
  end

  protected

  def strip_leading_and_trailing_whitespace
    self.name = name.strip
  end
end
