# RailsSettings Model
class Setting < RailsSettings::Base
  cache_prefix { 'v1' }

  # Indicates if this is the cloud or self-hosted product.
  field :cloud, type: :boolean, default: false

  field :domain_filter, type: :string, default: ''
  field :sign_up_enabled, type: :boolean, default: true

  # field :default_locale, default: "en", type: :string
  # field :confirmable_enable, default: "0", type: :boolean
  # field :admin_emails, default: "admin@rubyonrails.org", type: :array
  # field :omniauth_google_client_id, default: (ENV["OMNIAUTH_GOOGLE_CLIENT_ID"] || ""), type: :string, readonly: true
  # field :omniauth_google_client_secret, default: (ENV["OMNIAUTH_GOOGLE_CLIENT_SECRET"] || ""), type: :string, readonly: true
end
