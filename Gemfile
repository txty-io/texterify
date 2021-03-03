# frozen_string_literal: true

source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '6.0.3.4'
# Use postgresql as the database for Active Record
gem 'pg', '>= 0.18', '< 2.0'
# Use Puma as the app server
gem 'puma', '< 6'
# Use SCSS for stylesheets
gem 'sass-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use CoffeeScript for .coffee assets and views
# gem 'coffee-rails', '~> 4.2'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  # gem 'byebug', platforms: %i[mri mingw x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  # gem 'capybara'
  # gem 'selenium-webdriver'

  gem 'cypress-on-rails', '~> 1.0'
  gem 'database_cleaner'
  gem 'dotenv-rails'

  # Load automatically in dev for mailer previews which use factories.
  gem 'factory_bot_rails'

  gem 'database_consistency', require: false
  gem 'license_finder', require: false
  gem 'rubocop', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'listen'
  gem 'web-console'

  gem 'pry-byebug'
  gem 'pry-rails'

  # Spring speeds up development by keeping your application running in the background.
  # Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen'

  gem 'bumbler', require: false
  gem 'solargraph', require: false
end

group :test do
  gem 'rspec', require: false
  gem 'rspec-rails', require: false
  gem 'rspec-sidekiq' # rspec-sidekiq requires sidekiq/testing by default
  gem 'simplecov', require: false
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
# gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

gem 'devise', '4.7.3'
gem 'devise_token_auth', '1.1.4'
gem 'fast_jsonapi'
gem 'paper_trail'
gem 'pundit'
gem 'rails-settings-cached'
gem 'react-rails'
gem 'sentry-raven'
gem 'webpacker'

# https://rubygems.org/gems/gitlab-license/versions/0.0.2
# https://www.rubydoc.info/gems/gitlab-license/
gem 'gitlab-license'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', require: false

gem 'google-cloud-storage', '~> 1.11', require: false
gem 'rest-client', require: false
gem 'rubyzip', require: false

gem 'rack-cors'

gem 'sidekiq'
gem 'sidekiq-scheduler'
