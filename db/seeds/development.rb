# Seeds for the development environment.

user_1_id = '273dfbdf-5e2b-4cae-b2d5-c322746cfc0f'
user_2_id = 'fe35f1a7-de36-4ae9-a071-e8cd7d658fbe'
user_3_id = '55e86461-610a-42e9-9118-c9004658c07e'

user_1 = User.find_by(id: user_1_id)
if user_1
  puts "User '#{user_1.email}' with password 'password' already created."
else
  user_1 =
    User.create!(
      id: user_1_id,
      username: 'Test User 1',
      email: 'test1@texterify.com',
      password: 'password',
      password_confirmation: 'password',
      confirmed_at: Time.now,
      is_superadmin: true
    )
  user_1.skip_confirmation!
  puts "User '#{user_1.email}' with password 'password' created."
end

user_2 = User.find_by(id: user_2_id)
if user_2
  puts "User '#{user_2.email}' with password 'password' already created."
else
  user_2 =
    User.create!(
      id: user_2_id,
      username: 'Test User 2',
      email: 'test2@texterify.com',
      password: 'password',
      password_confirmation: 'password',
      confirmed_at: Time.now
    )
  user_2.skip_confirmation!
  puts "User '#{user_2.email}' with password 'password' created."
end

user_3 = User.find_by(id: user_3_id)
if user_3
  puts "User '#{user_3.email}' with password 'password' already created."
else
  user_3 =
    User.create!(
      id: user_3_id,
      username: 'Test User 3',
      email: 'test3@texterify.com',
      password: 'password',
      password_confirmation: 'password',
      confirmed_at: Time.now
    )
  user_3.skip_confirmation!
  puts "User '#{user_3.email}' with password 'password' created."
end

organization_1_id = '22e6b4da-4beb-4cad-ae8f-27e6026dd1a2'

organization = Organization.find_or_create_by!(id: organization_1_id, name: 'My Test Organization')
unless organization.users.include?(user_1)
  organization.users << user_1
end
unless organization.users.include?(user_2)
  organization.users << user_2
end
unless organization.users.include?(user_3)
  organization.users << user_3
end

project_1_id = '0e4a88fd-1d86-4ddd-bbaa-c5784ea5624f'
project_2_id = 'd7876785-356a-4b95-8733-933545281fa2'
project_3_id = '19ad8104-3a8c-4437-9838-f47022e76e4a'

project_1 = Project.find_or_create_by!(id: project_1_id, name: 'Test Project 1', organization_id: organization.id)
project_2 = Project.find_or_create_by!(id: project_2_id, name: 'Test Project 2', organization_id: organization.id)
project_3 = Project.find_or_create_by!(id: project_3_id, name: 'Test Project 3', organization_id: organization.id)

export_config_1_id = '3a8d8688-3e0b-4676-aa9a-72431b9045ce'
export_config_2_id = '241e30f5-c65a-496a-843f-01721d21247c'
export_config_3_id = '8bae7a79-03a8-47b0-bfa2-3a51f43baca9'

export_config_1 =
  ExportConfig.find_or_create_by!(
    id: export_config_1_id,
    project_id: project_1.id,
    name: 'Export Config 1 Android',
    file_format: FileFormat.find_by!(format: 'android'),
    file_path: 'values-{languageCode}/strings.xml',
    default_language_file_path: 'values/strings.xml',
    export_timestamp: true
  )
export_config_2 =
  ExportConfig.find_or_create_by!(
    id: export_config_2_id,
    project_id: project_1.id,
    name: 'Export Config 2 iOS',
    file_format: FileFormat.find_by!(format: 'ios'),
    file_path: '{languageCode}.lproj/Localizable.strings',
    export_timestamp: true
  )
export_config_3 =
  ExportConfig.find_or_create_by!(
    id: export_config_3_id,
    project_id: project_1.id,
    name: 'Export Config 3 JSON',
    file_format: FileFormat.find_by!(format: 'json'),
    file_path: '{languageCode}-{countryCode}.json',
    export_timestamp: true
  )

ProjectUser.find_or_create_by!(project_id: project_1.id, user_id: user_1.id, role: 'owner')
ProjectUser.find_or_create_by!(project_id: project_2.id, user_id: user_2.id, role: 'owner')
ProjectUser.find_or_create_by!(project_id: project_3.id, user_id: user_3.id, role: 'owner')

user_1_access_token_id = '4551b2e2-5c0d-4948-bb1f-adf999ae2e49'

user_1_access_token =
  AccessToken.find_or_create_by!(
    id: user_1_access_token_id,
    user_id: user_1.id,
    name: 'Access Token User 1',
    secret: 'SECRET'
  )

if License.count == 0
  license = License.new

  # Create test license
  private_key = OpenSSL::PKey::RSA.new(File.read('test_license_key'))
  Gitlab::License.encryption_key = private_key
  license_file = Gitlab::License.new
  license_file.licensee = { 'name': 'Name 1', 'email': 'test1@texterify.com' }
  license_file.starts_at = Date.new(Date.current.year, 10, 6)
  license_file.expires_at = Date.new(Date.current.year + 1, 10, 6)
  license_file.restrictions = { active_users_count: 10 }
  data = license_file.export

  license.data = data
  license.save!

  puts 'Test license for on-premise testing created.'
else
  puts 'Test license for on-premise testing already created.'
end

for i in 1..20
  Tag.find_or_create_by!(project_id: project_1_id, name: "Tag #{i}", custom: false)
end
