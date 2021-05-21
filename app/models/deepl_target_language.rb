class DeeplTargetLanguage < ApplicationRecord
  validates :language_code, presence: true, uniqueness: true
  validates :name, presence: true
end
