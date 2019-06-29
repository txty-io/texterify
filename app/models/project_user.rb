class ProjectUser < ApplicationRecord
  self.table_name = 'projects_users'

  belongs_to :user, dependent: :destroy
  belongs_to :project, dependent: :destroy
end
