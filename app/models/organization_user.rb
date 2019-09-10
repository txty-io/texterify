class OrganizationUser < ApplicationRecord
  self.table_name = 'organizations_users'

  belongs_to :user, dependent: :destroy
  belongs_to :organization, dependent: :destroy
end
