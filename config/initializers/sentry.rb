if ENV['SENTRY_DSN_BACKEND'].present? && Rails.env.production?
  Sentry.init { |config| config.dsn = ENV['SENTRY_DSN_BACKEND'] }
end
