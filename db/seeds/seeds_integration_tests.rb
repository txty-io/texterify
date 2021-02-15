load(Rails.root.join('db', 'seeds', "seeds_language_country_codes.rb").to_s)

user_1_id = '273dfbdf-5e2b-4cae-b2d5-c322746cfc0f'

user_1 = User.find_by(id: user_1_id)
if user_1
  puts "User '#{user_1.email}' with password 'password' already created."
else
  user_1 = User.create!(id: user_1_id, username: 'Test User 1', email: 'test1@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now, is_superadmin: true)
  user_1.skip_confirmation!
  puts "User '#{user_1.email}' with password 'password' created."
end
