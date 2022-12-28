class ImportSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :created_at, :status

  has_many :import_files
  belongs_to :user
end
