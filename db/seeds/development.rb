# Seeds for the development environment.

USER_1_ID = '273dfbdf-5e2b-4cae-b2d5-c322746cfc0f'
USER_2_ID = 'fe35f1a7-de36-4ae9-a071-e8cd7d658fbe'
USER_3_ID = '55e86461-610a-42e9-9118-c9004658c07e'

user_1 = User.find_by(id: USER_1_ID)
if user_1
  puts "User '#{user_1.email}' with password 'password' already created."
else
  user_1 = User.create!(id: USER_1_ID, username: 'Test User 1', email: 'test1@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now, is_superadmin: true)
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

PROJECT_1_ID = '0e4a88fd-1d86-4ddd-bbaa-c5784ea5624f'
PROJECT_2_ID = 'd7876785-356a-4b95-8733-933545281fa2'
PROJECT_3_ID = '19ad8104-3a8c-4437-9838-f47022e76e4a'

project_1 = Project.find_or_create_by!(id: PROJECT_1_ID, name: "Test Project 1")
project_2 = Project.find_or_create_by!(id: PROJECT_2_ID, name: "Test Project 2")
project_3 = Project.find_or_create_by!(id: PROJECT_3_ID, name: "Test Project 3")

EXPORT_CONFIG_1_ID = '3a8d8688-3e0b-4676-aa9a-72431b9045ce'
EXPORT_CONFIG_2_ID = '241e30f5-c65a-496a-843f-01721d21247c'
EXPORT_CONFIG_3_ID = '8bae7a79-03a8-47b0-bfa2-3a51f43baca9'

export_config_1 = ExportConfig.find_or_create_by!(id: EXPORT_CONFIG_1_ID, project_id: project_1.id, name: "Export Config 1 Android", file_format: "android", file_path: "values-{languageCode}/strings.xml", default_language_file_path: "values/strings.xml")
export_config_2 = ExportConfig.find_or_create_by!(id: EXPORT_CONFIG_2_ID, project_id: project_1.id, name: "Export Config 2 iOS", file_format: "ios", file_path: "{languageCode}.lproj/Localizable.strings")
export_config_3 = ExportConfig.find_or_create_by!(id: EXPORT_CONFIG_3_ID, project_id: project_1.id, name: "Export Config 3 JSON", file_format: "json", file_path: "{languageCode}-{countryCode}.json")

ProjectUser.find_or_create_by!(project_id: project_1.id, user_id: user_1.id, role: "owner")
ProjectUser.find_or_create_by!(project_id: project_2.id, user_id: user_2.id, role: "owner")
ProjectUser.find_or_create_by!(project_id: project_3.id, user_id: user_3.id, role: "owner")

USER_1_ACCESS_TOKEN_ID = '4551b2e2-5c0d-4948-bb1f-adf999ae2e49'

user_1_access_token = AccessToken.find_or_create_by!(id: USER_1_ACCESS_TOKEN_ID, user_id: user_1.id, name: "Access Token User 1", secret: 'SECRET')

if License.count == 0
  FactoryBot.create(:license)
end
