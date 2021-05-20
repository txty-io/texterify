class DeeplSourceLanguage < ApplicationRecord
  validates :language, presence: true, uniqueness: true
  validates :name, presence: true
end
