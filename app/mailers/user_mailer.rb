class UserMailer < ApplicationMailer
  def welcome(email, username)
    @username = username
    mail(to: email, subject: 'Welcome to Texterify')
  end
end
