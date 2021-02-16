load(Rails.root.join('db', 'seeds', "seeds_language_country_codes.rb").to_s)

user_1_id = '273dfbdf-5e2b-4cae-b2d5-c322746cfc0f'
user_2_id = 'fe35f1a7-de36-4ae9-a071-e8cd7d658fbe'
user_3_id = '55e86461-610a-42e9-9118-c9004658c07e'

user_1 = User.find_by(id: user_1_id)
if user_1
  puts "User '#{user_1.email}' with password 'password' already created."
else
  user_1 = User.create!(id: user_1_id, username: 'Test User 1', email: 'test1@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now, is_superadmin: true)
  user_1.skip_confirmation!
  puts "User '#{user_1.email}' with password 'password' created."
end

user_2 = User.find_by(id: user_2_id)
if user_2
  puts "User '#{user_2.email}' with password 'password' already created."
else
  user_2 = User.create!(id: user_2_id, username: 'Test User 2', email: 'test2@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now)
  user_2.skip_confirmation!
  puts "User '#{user_2.email}' with password 'password' created."
end

user_3 = User.find_by(id: user_3_id)
if user_3
  puts "User '#{user_3.email}' with password 'password' already created."
else
  user_3 = User.create!(id: user_3_id, username: 'Test User 3', email: 'test3@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now)
  user_3.skip_confirmation!
  puts "User '#{user_3.email}' with password 'password' created."
end

user_1_access_token_id = '4551b2e2-5c0d-4948-bb1f-adf999ae2e49'
user_2_access_token_id = '09336a75-2577-4eb4-a3b1-200c26307d86'
user_3_access_token_id = '605faab1-8000-4a03-b9af-4fb6ddf4c349'

user_1_access_token = AccessToken.find_or_create_by!(id: user_1_access_token_id, user_id: user_1.id, name: "Access Token User 1", secret: 'SECRET')
user_2_access_token = AccessToken.find_or_create_by!(id: user_2_access_token_id, user_id: user_2.id, name: "Access Token User 2", secret: 'SECRET')
user_3_access_token = AccessToken.find_or_create_by!(id: user_3_access_token_id, user_id: user_3.id, name: "Access Token User 3", secret: 'SECRET')
