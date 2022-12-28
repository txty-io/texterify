class ImportFileSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :status

  belongs_to :import
end
