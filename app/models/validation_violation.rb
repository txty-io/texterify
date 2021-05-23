class ValidationViolation < ApplicationRecord
  belongs_to :project
  belongs_to :validation
end
