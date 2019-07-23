class KeySerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description, :html_enabled
  has_many :translations
end
