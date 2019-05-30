class ProjectColumnSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :show_name, :show_description

  has_many :languages
end
