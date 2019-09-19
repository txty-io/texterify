class ProjectSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description
  belongs_to :organization
  has_many :keys
  has_many :languages
  has_many :project_columns
end
