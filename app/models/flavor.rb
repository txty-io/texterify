class Flavor < ApplicationRecord
  belongs_to :project

  has_many :export_configs, dependent: :destroy

  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, presence: true
  validate :no_duplicates_for_project

  def name=(name)
    self[:name] = name.strip
  end

  # Validates that there are no flavors with the same name for a project.
  def no_duplicates_for_project
    project = Project.find(project_id)
    flavor = project.flavors.find_by(name: name)

    if flavor.present?
      updating_flavor = flavor.id == id

      if !updating_flavor
        errors.add(:name, :taken)
      end
    end
  end
end
