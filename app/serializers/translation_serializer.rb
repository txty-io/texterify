class TranslationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :content
  belongs_to :language
  belongs_to :export_config
end
