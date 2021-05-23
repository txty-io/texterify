class Validation < ApplicationRecord
  belongs_to :organization, optional: true
  belongs_to :project, optional: true
end
