class CountryCodeSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :code
end
