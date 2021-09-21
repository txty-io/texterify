class WordpressPolylangConnectionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :wordpress_url, :auth_user
end
