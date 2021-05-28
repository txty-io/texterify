class DeeplSourceLanguage < ApplicationRecord
  validates :language_code, presence: true
  validates :name, presence: true
end
