class TranslationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :content, :key_id, :language_id, :created_at
  belongs_to :language
  belongs_to :export_config
  belongs_to :key
end
