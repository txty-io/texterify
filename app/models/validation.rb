class Validation < ApplicationRecord
  belongs_to :organization, optional: true
  belongs_to :project, optional: true
  has_many :validation_violations, dependent: :destroy

  validates :name, presence: true
  validates :match, presence: true
  validates :content, presence: true
end
