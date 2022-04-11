class Validation < ApplicationRecord
  belongs_to :organization, optional: true
  belongs_to :project, optional: true
  has_many :validation_violations, dependent: :destroy
end
