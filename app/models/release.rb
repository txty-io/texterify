class Release < ApplicationRecord
  belongs_to :export_config
  delegate :project, to: :export_config

  validates :from_version, presence: true
  validates :to_version, presence: true
  validates :url, presence: true
end
