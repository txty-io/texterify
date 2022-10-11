class LanguagePlural < ApplicationRecord
  validates :code, presence: true
  validates :supports_plural_zero, inclusion: [true, false]
  validates :supports_plural_one, inclusion: [true, false]
  validates :supports_plural_two, inclusion: [true, false]
  validates :supports_plural_few, inclusion: [true, false]
  validates :supports_plural_many, inclusion: [true, false]
end
