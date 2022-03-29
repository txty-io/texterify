user_id = '11a0d665-9c2b-472c-96d0-af630fd63ca7'
project_id = 'e5705170-2bc1-4fd8-9b41-4fe2b46bfe74'

user =
  User.create!(
    id: user_id,
    username: 'project-with-keys',
    email: 'project-with-keys@texterify.com',
    password: 'password',
    password_confirmation: 'password',
    confirmed_at: Time.now.utc,
    is_superadmin: true
  )
user.skip_confirmation!

organization = Organization.create!(name: 'project-with-keys-organization')
organization.users << user

project = Project.create!(id: project_id, organization_id: organization.id, name: 'project-with-keys-project')
ProjectUser.create!(project_id: project.id, user_id: user.id, role: 'owner')

key_names = [
  'a000',
  'a111',
  'a222',
  'a333',
  'a444',
  'a555',
  'a666',
  'a777',
  'a888',
  'a999',
  'b000',
  'b111',
  'b222',
  'b333',
  'b444',
  'b555',
  'b666',
  'b777',
  'b888',
  'b999'
]

key_names.each do |name|
  key = Key.new
  key.project = project
  key.name = name
  key.save!
end
