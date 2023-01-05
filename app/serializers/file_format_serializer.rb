class FileFormatSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :format, :import_support, :export_support, :plural_support, :skip_empty_plural_translations_support
end
