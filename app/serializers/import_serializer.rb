class ImportSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :created_at, :status, :project_id

  has_many :import_files
  has_one :background_job
  belongs_to :user
end
