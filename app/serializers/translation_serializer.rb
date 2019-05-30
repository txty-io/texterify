class TranslationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :content
  belongs_to :language
end
