class FileFormatExtensionSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :extension
end
