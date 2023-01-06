class FileFormatFileFormatExtension < ApplicationRecord
  self.table_name = 'file_formats_file_format_extensions'

  belongs_to :file_format
  belongs_to :file_format_extension
end
