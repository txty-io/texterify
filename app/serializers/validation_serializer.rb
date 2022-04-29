class ValidationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id,
             :name,
             :description,
             :match,
             :content,
             :enabled,
             :project_id,
             :organization_id,
             :language_code_id,
             :country_code_id

  belongs_to :language_code
  belongs_to :country_code
end
