RSpec.configure do |config|
  config.before(:suite) do
    # puts '[rspec]: before suite'

    DatabaseCleaner.clean_with(:truncation)
    load(Rails.root.join('db', 'seeds.rb').to_s)
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each) do
    # puts '[rspec]: before each'

    # Start transaction.
    DatabaseCleaner.start

    # Clear all queued jobs.
    Sidekiq::Worker.clear_all
  end

  config.after(:each) do
    # puts '[rspec]: after each'

    # Revert transaction.
    DatabaseCleaner.clean

    # Reload factory to reset sequences between tests so tests are deterministic when
    # using snapshots in combination with sequences (e.g. "Organization 1").
    FactoryBot.reload
  end
end
