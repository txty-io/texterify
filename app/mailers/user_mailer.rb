class UserMailer < ApplicationMailer
  def welcome(email, username)
    @username = username
    mail(to: email, subject: 'Welcome to Texterify')
  end

  def invite(email, invite_from, on_premise)
    @invite_from = invite_from
    @on_premise = on_premise
    mail(to: email, subject: 'You have been invited to Texterify')
  end
end
