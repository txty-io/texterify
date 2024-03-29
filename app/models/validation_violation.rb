class ValidationViolation < ApplicationRecord
  belongs_to :project
  belongs_to :translation
  belongs_to :validation, optional: true
  belongs_to :forbidden_word, optional: true
  belongs_to :placeholder, optional: true
end
