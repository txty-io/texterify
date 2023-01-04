if ENV['SENTRY_DSN_BACKEND'].present?
  Sentry.init { |config| config.dsn = ENV['SENTRY_DSN_BACKEND'] }
end
