class ProjectSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description
  belongs_to :organization
  has_many :keys
  has_many :languages
  has_many :project_columns, if: proc { |record, params|
    record.user_id == params[:current_user].id
  }
end
