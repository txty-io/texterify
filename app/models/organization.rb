class Organization < ApplicationRecord
  validates :name, uniqueness: true, presence: true

  has_many :organization_users, dependent: :delete_all
  has_many :users, through: :organization_users
  has_many :projects, dependent: :destroy

  has_one_attached :image

  def role_of(user)
    organization_users.find_by(user_id: user.id).role
  end
end
