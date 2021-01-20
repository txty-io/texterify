class ProjectUserSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :role

  belongs_to :user
  belongs_to :project
end
