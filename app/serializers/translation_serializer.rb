class TranslationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :key_id, :language_id, :zero, :one, :two, :few, :many, :content
  belongs_to :language
  belongs_to :export_config
  belongs_to :key
end
