# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

# Silence deprecation warnings because of
# "DEPRECATION WARNING: connection_config is deprecated and will be removed from Rails 6.2 (Use connection_db_config instead)"
# which comes from a gem and is printed for every test being run.
ActiveSupport::Deprecation.silenced = true

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Texterify
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.0

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Disable generators.
    config.generators do |g|
      g.assets nil
      g.helper nil
      g.template_engine nil
      g.view_specs nil
      g.helper_specs nil
      g.skip_routes true

      g.test_framework :rspec,
                       fixtures: true,
                       view_specs: true,
                       helper_specs: true,
                       routing_specs: true,
                       controller_specs: true,
                       request_specs: true

      # Use UUID per default as id.
      g.orm :active_record, primary_key_type: :uuid
    end

    config.to_prepare { Devise::Mailer.layout 'email' }

    config.autoload_paths << "#{root}/app/lib"
  end
end
