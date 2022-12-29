class ImportFileTranslation < ApplicationRecord
  belongs_to :import_file

  validates :key_name, presence: true
end
