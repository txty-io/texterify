class KeySerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :project_id, :name, :description, :html_enabled, :name_editable
  has_many :translations
  has_many :tags
  has_many :wordpress_contents
end
