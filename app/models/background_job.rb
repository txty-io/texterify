class BackgroundJob < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :status, presence: true
  validates :progress, presence: true
  validates :job_type, presence: true
end
