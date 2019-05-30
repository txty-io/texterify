class KeySerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description
  has_many :translations
end
