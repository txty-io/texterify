class Organization < ApplicationRecord
  default_scope { order('lower(organizations.name) ASC') }

  validates :name, uniqueness: true, presence: true

  has_many :organization_users, dependent: :delete_all
  has_many :users, through: :organization_users
  has_many :projects, dependent: :destroy
  has_many :project_users, through: :projects, dependent: :destroy

  has_one_attached :image

  def name=(name)
    self[:name] = name.strip
  end

  def role_of(user)
    organization_user = organization_users.find_by(user_id: user.id)
    organization_user ? organization_user.role : nil
  end
end
