load(Rails.root.join('db', 'seeds', "seeds_language_country_codes.rb").to_s)

USER_1_ID = '273dfbdf-5e2b-4cae-b2d5-c322746cfc0f' unless defined? USER_1_ID

user_1 = User.find_by(id: USER_1_ID)
if user_1
  puts "User '#{user_1.email}' with password 'password' already created."
else
  user_1 = User.create!(id: USER_1_ID, username: 'Test User 1', email: 'test1@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now, is_superadmin: true)
  user_1.skip_confirmation!
  puts "User '#{user_1.email}' with password 'password' created."
end
