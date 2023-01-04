# Set sidekiq to an inline mode that runs the job immediately instead of enqueuing it.
# Learn more here:
#   - https://github.com/philostler/rspec-sidekiq
#   - https://github.com/mperham/sidekiq/wiki/Testing
require 'sidekiq/testing'
Sidekiq::Testing.inline!
puts '[sidekiq]: Sidekiq::Testing.inline! called'

Sidekiq.configure_server { |config| config.redis = { url: 'redis://redis:6379/0' } }

Sidekiq.configure_client { |config| config.redis = { url: 'redis://redis:6379/0' } }
