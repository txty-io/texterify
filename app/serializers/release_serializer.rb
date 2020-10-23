class ReleaseSerializer
  include FastJsonapi::ObjectSerializer
  belongs_to :export_config
  has_many :release_files
  attributes :id, :version, :timestamp
end
