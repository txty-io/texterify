# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'

# ENV['RAILS_ENV'] ||= 'test'
ENV['RAILS_ENV'] = 'test'

require File.expand_path('../config/environment', __dir__)

# Prevent database truncation if the environment is production
if Rails.env.production?
  abort('The Rails environment is running in production mode!')
end

require 'rspec/rails'

Sidekiq::Testing.inline! # an inline mode that runs the job immediately instead of enqueuing it

# Add additional requires below this line. Rails is not loaded until this point!

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }

# Checks for pending migrations and applies them before tests are run.
# If you are not using ActiveRecord, you can remove these lines.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  puts e.to_s.strip
  exit 1
end
RSpec.configure do |config|
  # Add own login helper functions like "sign_in(user)" for easy authentication.
  config.include LoginHelper

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures.
  config.fixture_path = Rails.root.join('spec', 'fixtures')

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  # We use the "database_cleaner" gem instead.
  # Learn more here: https://relishapp.com/rspec/rspec-rails/docs/transactions
  config.use_transactional_fixtures = false

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  # Learn more here: https://relishapp.com/rspec/rspec-rails/docs/backtrace-filtering
  config.filter_rails_from_backtrace!

  # Helper methods like "create(:model)" or "build(:model)".
  # Without everything needs to be prefaced with "FactoryBot".
  # Learn more here:
  #   - https://www.rubydoc.info/gems/factory_bot/FactoryBot/Syntax/Methods
  #   - https://github.com/thoughtbot/factory_bot/blob/main/GETTING_STARTED.md#configure-your-test-suite
  config.include FactoryBot::Syntax::Methods

  # During rspec tests we don't really want to execute jobs.
  # After the rspec tests we reactivate the real jobs queue via redis (e.g. for the cypress tests).
  # Learn more here: https://github.com/mperham/sidekiq/wiki/Testing
  config.before(:suite) { Sidekiq::Testing.fake! }
  config.after(:suite) { Sidekiq::Testing.inline! }
end

# Learn more here: https://github.com/philostler/rspec-sidekiq#configuration
RSpec::Sidekiq.configure do |config|
  # Clears all job queues before each example
  config.clear_all_enqueued_jobs = true # default => true

  # Whether to use terminal colours when outputting messages
  config.enable_terminal_colours = true # default => true

  # Warn when jobs are not enqueued to Redis but to a job array
  config.warn_when_jobs_not_processed_by_sidekiq = true # default => true
end
