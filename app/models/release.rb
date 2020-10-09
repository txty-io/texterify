class Release < ApplicationRecord
  belongs_to :export_config
  delegate :project, to: :export_config
end
