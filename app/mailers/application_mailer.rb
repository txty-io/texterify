# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default(
    from: "Texterify <#{ENV.fetch('SMTP_FROM_EMAIL', 'no-reply@example.com')}>",
    reply_to: "Texterify <#{ENV.fetch('SMTP_FROM_EMAIL', 'no-reply@example.com')}>"
  )
  layout 'email'
end
