class FileFormatSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id,
             :format,
             :name,
             :import_support,
             :export_support,
             :plural_support,
             :skip_empty_plural_translations_support

  has_many :file_format_extensions
end
