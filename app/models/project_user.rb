class ProjectUser < ApplicationRecord
  self.table_name = 'projects_users'

  attr_accessor :role_before_update

  belongs_to :user
  belongs_to :project
end
