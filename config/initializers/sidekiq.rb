# Set sidekiq to an inline mode that runs the job immediately instead of enqueuing it.
# Learn more here:
#   - https://github.com/philostler/rspec-sidekiq
#   - https://github.com/mperham/sidekiq/wiki/Testing
if Rails.env.test?
  require 'sidekiq/testing'
  Sidekiq::Testing.inline!
  puts '[sidekiq]: Sidekiq jobs are processed during tests from now on.'
end

Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch('SIDEKIQ_REDIS_SERVER_URL', 'redis://redis:6379/0') }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch('SIDEKIQ_REDIS_CLIENT_URL', 'redis://redis:6379/0') }
end
