class OrganizationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name
  has_many :projects
end
