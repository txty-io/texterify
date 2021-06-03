class ValidationViolationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :ignored, :project_id, :validation_id, :translation_id
  belongs_to :project
  belongs_to :validation
  belongs_to :translation
end
