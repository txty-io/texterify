class ImportFile < ApplicationRecord
  belongs_to :import
  belongs_to :language, optional: true
  belongs_to :file_format, optional: true

  has_many :import_file_translations, dependent: :destroy

  has_one_attached :file

  validates :name, presence: true
  validates :status, presence: true
end
