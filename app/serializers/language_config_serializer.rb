class LanguageConfigSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :language_code, :language_id
end
