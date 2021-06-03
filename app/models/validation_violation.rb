class ValidationViolation < ApplicationRecord
  belongs_to :project
  belongs_to :translation
  belongs_to :validation, optional: true
end
