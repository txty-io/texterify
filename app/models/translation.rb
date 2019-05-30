class Translation < ApplicationRecord
  has_paper_trail

  default_scope { order(created_at: :desc) }

  belongs_to :key
  belongs_to :language
end
