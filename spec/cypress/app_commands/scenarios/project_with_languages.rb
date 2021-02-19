user_id = '975c9674-97de-483c-bcff-f12bd42e9f06'
project_id = 'f03a8834-424a-419f-8b92-a7283da76a1f'

user = User.create!(id: user_id, username: 'project-with-languages', email: 'project-with-languages@texterify.com', password: 'password', password_confirmation: 'password', confirmed_at: Time.now.utc, is_superadmin: true)
user.skip_confirmation!

project = Project.create!(id: project_id, name: 'project-with-languages-project')
ProjectUser.create!(project_id: project.id, user_id: user.id, role: 'owner')

language_names = [
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

language_names.each do |name|
  language = Language.new
  language.project = project
  language.name = name
  language.save!
end
