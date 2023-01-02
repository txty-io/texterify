class ImportFileSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :status, :status_message, :error_message

  belongs_to :import
end
