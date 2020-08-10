class PostProcessingRule < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, presence: true
  validates :search_for, presence: true
  validates :replace_with, presence: true

  before_validation :strip_leading_and_trailing_whitespace
  validate :no_duplicate_rules_for_project

  belongs_to :project
  belongs_to :export_config, optional: true

  # Validates that there are no rules with the same name for a project.
  def no_duplicate_rules_for_project
    project = Project.find(project_id)
    post_processing_rule = project.post_processing_rules.find_by(name: name)

    if post_processing_rule.present?
      updating_post_processing_rule = post_processing_rule.id == id

      errors.add(:name, :taken) if !updating_post_processing_rule
    end
  end

  protected

  def strip_leading_and_trailing_whitespace
    self.name = name.strip
  end
end
