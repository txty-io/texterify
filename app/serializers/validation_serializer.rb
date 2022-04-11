class ValidationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description, :match, :content, :enabled
end
