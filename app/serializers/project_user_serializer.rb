class ProjectUserSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :role, :deactivated, :deactivated_reason, :user_id, :project_id

  belongs_to :user
  belongs_to :project
end
