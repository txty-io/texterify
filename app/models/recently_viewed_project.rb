class RecentlyViewedProject < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :last_accessed, presence: true
end
