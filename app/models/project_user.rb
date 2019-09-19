class ProjectUser < ApplicationRecord
  self.table_name = 'projects_users'

  belongs_to :user
  belongs_to :project
end
