class DeeplSourceLanguageSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :language_code, :country_code
end
