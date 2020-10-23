class ReleaseFileSerializer
  include FastJsonapi::ObjectSerializer
  belongs_to :release
  attributes :id, :language_code, :country_code, :url, :preview_url
end
