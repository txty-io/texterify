class FileFormatFileFormatExtensionSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :file_format_id, :file_format_extension_id
end
