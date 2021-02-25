load(Rails.root.join('db', 'seeds', "seeds_language_country_codes.rb").to_s)

USER_1_ID = '273dfbdf-5e2b-4cae-b2d5-c322746cfc0f'
USER_2_ID = 'fe35f1a7-de36-4ae9-a071-e8cd7d658fbe'
USER_3_ID = '55e86461-610a-42e9-9118-c9004658c07e'

user_1 = User.find_by(id: user_1_id)
if user_1
  puts "User '#{user_1.email}' with password 'password' already created."
else
  user_1 = User.create!(id: user_1_id, username: 'Test User 1', email: 'test1@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now, is_superadmin: true)
  user_1.skip_confirmation!
  puts "User '#{user_1.email}' with password 'password' created."
end

user_2 = User.find_by(id: USER_2_ID)
if user_2
  puts "User '#{user_2.email}' with password 'password' already created."
else
  user_2 = User.create!(id: USER_2_ID, username: 'Test User 2', email: 'test2@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now)
  user_2.skip_confirmation!
  puts "User '#{user_2.email}' with password 'password' created."
end

user_3 = User.find_by(id: USER_3_ID)
if user_3
  puts "User '#{user_3.email}' with password 'password' already created."
else
  user_3 = User.create!(id: USER_3_ID, username: 'Test User 3', email: 'test3@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now)
  user_3.skip_confirmation!
  puts "User '#{user_3.email}' with password 'password' created."
end
