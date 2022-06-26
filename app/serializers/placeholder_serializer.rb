class PlaceholderSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :key_id, :name, :description
end
