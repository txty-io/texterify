class TagSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :custom, :project_id
end
