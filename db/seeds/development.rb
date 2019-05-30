# Seeds for the development environment.

user = User.create(username: 'Test User 1', email: 'test@texterify.com', password: 'password', password_confirmation: 'password')
user.skip_confirmation!
if user.save
  puts "User '#{user.email}' with password '#{user.password}' created."
else
  puts "User '#{user.email}' with password '#{user.password}' already created."
end

user = User.create(username: 'Test User 2', email: 'test2@texterify.com', password: 'password', password_confirmation: 'password')
user.skip_confirmation!
if user.save
  puts "User '#{user.email}' with password '#{user.password}' created."
else
  puts "User '#{user.email}' with password '#{user.password}' already created."
end

user = User.create(username: 'Test User 3', email: 'test3@texterify.com', password: 'password', password_confirmation: 'password')
user.skip_confirmation!
if user.save
  puts "User '#{user.email}' with password '#{user.password}' created."
else
  puts "User '#{user.email}' with password '#{user.password}' already created."
end
