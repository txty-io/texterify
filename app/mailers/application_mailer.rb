# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default(
    from: "Texterify <no-reply@#{ENV['MAILER_HOST']}>",
    reply_to: "Texterify <no-reply@#{ENV['MAILER_HOST']}>"
  )
  layout 'email'
end
