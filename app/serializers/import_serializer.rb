class ImportSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :files, :created_at, :status

  belongs_to :user
end
