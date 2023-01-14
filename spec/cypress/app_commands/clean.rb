if defined?(DatabaseCleaner)
  # cleaning the database using database_cleaner
  DatabaseCleaner.strategy = :truncation
  DatabaseCleaner.clean
else
  logger.warn 'add database_cleaner or update cypress/app_commands/clean.rb'
  # if defined?(Post)
  #   Post.delete_all
  # end
end

CypressOnRails::SmartFactoryWrapper.reload

if defined?(VCR)
  VCR.eject_cassette # make sure we no cassette inserted before the next test starts
  VCR.turn_off!
  if defined?(WebMock)
    WebMock.disable!
  end
end

Rails.logger.info 'APPCLEANED' # used by log_fail.rb
