class DeviseMailerPreview < ActionMailer::Preview
  def confirmation_instructions
    user = User.new
    user.username = 'Christoph Werner'
    user.email = 'test@texterify.com'
    Devise::Mailer.confirmation_instructions(user, '')
  end

  def reset_password_instructions
    user = User.new
    user.username = 'Christoph Werner'
    user.email = 'test@texterify.com'
    Devise::Mailer.reset_password_instructions(user, '')
  end
end
