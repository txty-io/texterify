# Preview all emails at http://localhost:3000/rails/mailers/subscriptions
class UserPreview < ActionMailer::Preview
  def invite
    UserMailer.invite('test@texterify.com', 'inviter@texterify.com', false)
  end

  def invite_on_premise
    UserMailer.invite('test@texterify.com', 'inviter@texterify.com', true)
  end
end
