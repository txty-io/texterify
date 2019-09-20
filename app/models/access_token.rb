class AccessToken < ApplicationRecord
  belongs_to :user

  validates :name, presence: true, uniqueness: { scope: [:user_id] }
  validates :secret, presence: true
end
