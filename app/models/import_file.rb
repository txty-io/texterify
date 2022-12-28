class ImportFile < ApplicationRecord
  belongs_to :import
  belongs_to :language, optional: true
  belongs_to :file_format, optional: true

  has_one_attached :file
end
