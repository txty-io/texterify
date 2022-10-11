class TagSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :custom, :project_id, :disable_translation_for_translators
end
