class CountryCode < ApplicationRecord
  has_many :languages, dependent: :nullify
end
