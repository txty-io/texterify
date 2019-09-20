class CountryCode < ApplicationRecord
  has_many :languages, dependent: :nullify
  validates :name, presence: true
  validates :code, presence: true
end
