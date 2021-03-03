RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
    load(Rails.root.join('db', 'seeds.rb').to_s)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do
    DatabaseCleaner.start
    Sidekiq::Worker.clear_all
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end
