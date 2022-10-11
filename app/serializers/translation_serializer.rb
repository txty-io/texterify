class TranslationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :key_id, :language_id, :zero, :one, :two, :few, :many, :content, :created_at
  belongs_to :language
  belongs_to :flavor
  belongs_to :key
end
