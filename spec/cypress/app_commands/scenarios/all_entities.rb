user_owner =
  User.create!(
    id: '0c537a53-7656-4d68-bcef-c6dbf5ab50c1',
    username: 'user_owner',
    email: 'user_owner@texterify.com',
    password: 'password',
    password_confirmation: 'password',
    confirmed_at: Time.now.utc,
    is_superadmin: true
  )
user_owner.skip_confirmation!

user_developer =
  User.create!(
    id: 'd8475ed3-ab5c-4080-b45d-b5ae6fd3e0d5',
    username: 'user_developer',
    email: 'user_developer@texterify.com',
    password: 'password',
    password_confirmation: 'password',
    confirmed_at: Time.now.utc,
    is_superadmin: true
  )
user_developer.skip_confirmation!

user_translator =
  User.create!(
    id: 'b4a86874-adbe-4c9e-bb68-f51eb73828eb',
    username: 'user_translator',
    email: 'user_translator@texterify.com',
    password: 'password',
    password_confirmation: 'password',
    confirmed_at: Time.now.utc,
    is_superadmin: true
  )
user_translator.skip_confirmation!

organization_no_plan = Organization.create!(name: 'organization_no_plan')
OrganizationUser.create!(organization_id: organization_no_plan.id, user_id: user_owner.id, role: 'owner')
OrganizationUser.create!(organization_id: organization_no_plan.id, user_id: user_developer.id, role: 'developer')
OrganizationUser.create!(organization_id: organization_no_plan.id, user_id: user_translator.id, role: 'translator')

organization_free_trial =
  Organization.create!(name: 'organization_free_trial', trial_ends_at: (Time.now.utc + 7.days).end_of_day)
OrganizationUser.create!(organization_id: organization_free_trial.id, user_id: user_owner.id, role: 'owner')
OrganizationUser.create!(organization_id: organization_free_trial.id, user_id: user_developer.id, role: 'developer')
OrganizationUser.create!(organization_id: organization_free_trial.id, user_id: user_translator.id, role: 'translator')

project_no_plan =
  Project.create!(
    id: '7e9c194a-5cb7-4e6e-9536-942c5268eb2e',
    organization_id: organization_no_plan.id,
    name: 'project_no_plan'
  )
ProjectUser.create!(project_id: project_no_plan.id, user_id: user_owner.id, role: 'owner')
ProjectUser.create!(project_id: project_no_plan.id, user_id: user_developer.id, role: 'developer')
ProjectUser.create!(project_id: project_no_plan.id, user_id: user_translator.id, role: 'translator')

project_free_trial =
  Project.create!(
    id: '0e1bda4b-cd24-4585-80bb-d3b80701107a',
    organization_id: organization_free_trial.id,
    name: 'project_free_trial'
  )
ProjectUser.create!(project_id: project_free_trial.id, user_id: user_owner.id, role: 'owner')
ProjectUser.create!(project_id: project_free_trial.id, user_id: user_developer.id, role: 'developer')
ProjectUser.create!(project_id: project_free_trial.id, user_id: user_translator.id, role: 'translator')

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

language_at = Language.new
language_at.id = 'd35fa760-dc8a-4ce4-a3d4-2d856f212541'
language_at.project = project_no_plan
language_at.name = 'at'
language_at.save!

language_de = Language.new
language_de.id = 'be5c3698-623f-479c-8ef6-522a4a2fb088'
language_de.project = project_no_plan
language_de.name = 'de'
language_de.save!

language_at = Language.new
language_at.id = '289cbe0e-e4cb-4adb-b147-1b7134c442d9'
language_at.project = project_free_trial
language_at.name = 'at'
language_at.save!

language_de = Language.new
language_de.id = 'a9ceb119-2e5d-460a-a180-965c1813901d'
language_de.project = project_free_trial
language_de.name = 'de'
language_de.save!

[project_no_plan, project_free_trial].each do |project|
  key_names.each do |name|
    key = Key.new
    key.project = project
    key.name = name
    key.save!
  end
end
