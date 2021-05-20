class DeeplTargetLanguage < ApplicationRecord
  validates :language, presence: true, uniqueness: true
  validates :name, presence: true
end
