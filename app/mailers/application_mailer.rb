# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: 'no-reply@texterify.com'
  layout 'email'
end
