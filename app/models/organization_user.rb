class OrganizationUser < ApplicationRecord
  self.table_name = 'organizations_users'

  belongs_to :user
  belongs_to :organization
end
