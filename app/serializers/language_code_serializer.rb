class LanguageCodeSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :code
end
