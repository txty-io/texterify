class User < ApplicationRecord
  include DeviseTokenAuth::Concerns::User

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable

  validates :username, uniqueness: true, presence: true

  has_many :project_users, dependent: :delete_all
  has_many :projects, through: :project_users

  has_many :access_tokens, dependent: :destroy
  has_one_attached :image

  def admin_of?(project)
    true
  end
end
