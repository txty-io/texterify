class Placeholder < ApplicationRecord
  belongs_to :key

  validates :name, presence: true
end
