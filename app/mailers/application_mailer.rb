# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default(
    from: "Texterify <no-reply@#{ENV.fetch('MAILER_HOST', 'example.com')}>",
    reply_to: "Texterify <no-reply@#{ENV.fetch('MAILER_HOST', 'example.com')}>"
  )
  layout 'email'
end
