if ENV['SENTRY_DSN_BACKEND'].present? && Rails.env.production?
  Sentry.init do |config|
    config.dsn = ENV['SENTRY_DSN_BACKEND']
    config.traces_sample_rate = 1.0
  end
end
