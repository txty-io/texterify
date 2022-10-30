class FlavorSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name
end
