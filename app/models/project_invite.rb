class ProjectInvite < ApplicationRecord
  belongs_to :project

  validates :email, presence: true
  validates :role, presence: true
end
