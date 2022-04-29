class ValidationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description, :match, :content, :enabled, :project_id, :organization_id
end
