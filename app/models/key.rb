class Key < ApplicationRecord
  has_paper_trail

  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }
  scope :ilike_name_or_description_or_translation_content, lambda { |search|
    where(
      'keys.name ilike :search or keys.description ilike :search or translations.content ilike :search',
      search: "%#{sanitize_sql_like(search)}%"
    )
  }
  scope :distinct_on_lower_name, -> { select('distinct on (lower("keys"."name")) keys.*') }

  belongs_to :project
  has_many :translations, dependent: :destroy

  validates :name, presence: true
  validate :no_duplicate_keys_for_project

  before_validation :strip_leading_and_trailing_whitespace

  # Validates that there are no keys with same name for a project.
  def no_duplicate_keys_for_project
    project = Project.find(project_id)
    key = project.keys.find_by(name: name)

    if key.present?
      updating_key = key.id == id

      errors.add(:name, :taken) if !updating_key
    end
  end

  protected

  def strip_leading_and_trailing_whitespace
    self.name = name.strip
  end
end
