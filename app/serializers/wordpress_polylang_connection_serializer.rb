class WordpressPolylangConnectionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :wordpress_url, :auth_user

  attribute :password_set do |connection|
    connection.auth_password.present?
  end
end
