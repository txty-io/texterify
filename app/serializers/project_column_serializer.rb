class ProjectColumnSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :show_name, :show_description, :show_tags, :show_overwrites

  has_many :languages
end
