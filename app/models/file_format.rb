class FileFormat < ApplicationRecord
  has_many :file_format_file_format_extensions, dependent: :delete_all
  has_many :file_format_extensions, through: :file_format_file_format_extensions

  validates :format, presence: true
  validates :name, presence: true
  validates :import_support, inclusion: { in: [true, false] }
  validates :export_support, inclusion: { in: [true, false] }

  # Declares if the file format has a special handling for plural forms or if the
  # plurals are exported as separate keys.
  validates :plural_support, inclusion: { in: [true, false] }

  validates :skip_empty_plural_translations_support, inclusion: { in: [true, false] }

  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }
end
