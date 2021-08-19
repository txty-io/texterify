class OrganizationInvite < ApplicationRecord
  belongs_to :organization

  validates :email, uniqueness: { scope: :organization }, presence: true
  validates :role, presence: true
end
