class FileFormatExtension < ApplicationRecord
  has_many :file_format_file_format_extensions, dependent: :delete_all
  has_many :file_formats, through: :file_format_file_format_extensions

  scope :order_by_name, -> { order(arel_table['extension'].lower.asc) }
end
