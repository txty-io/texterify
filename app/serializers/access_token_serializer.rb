class AccessTokenSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :created_at, :name
end
