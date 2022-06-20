class OrganizationInvite < ApplicationRecord
  belongs_to :organization

  validates :email, presence: true
  validates :role, presence: true
end
