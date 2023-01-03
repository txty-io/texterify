RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
    load(Rails.root.join('db', 'seeds.rb').to_s)
  end

  config.before(:each) { DatabaseCleaner.strategy = :transaction }

  config.before(:each, js: true) { DatabaseCleaner.strategy = :truncation }

  config.before(:each) do
    DatabaseCleaner.start

    # Clear all queued jobs.
    Sidekiq::Worker.clear_all
  end

  config.after(:each) do
    DatabaseCleaner.clean

    # Reload factory to reset sequences between tests so tests are deterministic when
    # using snapshots in combination with sequences (e.g. "Organization 1").
    FactoryBot.reload
  end
end
