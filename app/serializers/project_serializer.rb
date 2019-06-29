class ProjectSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description
  has_many :keys
  has_many :languages
  has_many :project_columns, if: proc { |record, params|
    record.user_id == params[:current_user].id
  }
end
