class ReleaseSerializer
  include FastJsonapi::ObjectSerializer
  belongs_to :export_config
  attributes :id, :from_version, :to_version, :url
end
