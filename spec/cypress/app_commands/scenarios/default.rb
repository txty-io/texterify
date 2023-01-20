# rubocop:disable Rails/SkipsModelValidations

user_id = '86d959da-9ff8-444d-8623-6614bfa5476e'
organization_id = '854fed83-7a1b-4597-af65-48c3613de3e4'
project_ids = {
  '1' => '1bfa0215-46d2-478c-8cba-54df0f89c8d4',
  '2' => '1ba85b6a-ddcf-4058-8b72-15d7e355197e',
  '3' => '8c53ceb0-162c-45b3-b255-83dab4a08233',
  '4' => 'c221f8a0-94b9-4318-83b2-dbf9705059d9',
  '5' => 'd1390154-a1c5-44e1-87db-ff766e26cda0',
  '6' => '11ec0b1a-01a8-45a8-b4a4-92a821feff10',
  '7' => '61bcfa54-fb51-45d0-9a77-9869e4aef9cb',
  '8' => 'acd371c5-ccc0-437b-b91c-19e2cae0dafc',
  '9' => '1d56b3bf-51f6-45da-afa7-fbd2d2000561',
  '10' => 'bd6869ed-d0d8-45e4-815d-a5890ec585ea',
  '11' => '476983ea-9d3b-4f87-bde2-da13d30b887d'
}
project_languages = {
  '1bfa0215-46d2-478c-8cba-54df0f89c8d4' => [
    { name: 'German', id: '5229b07a-5ab6-4f2a-8a0f-abf5a36e238e' },
    { name: 'English', id: 'c454538f-4415-474e-81b2-d081d0079627' },
    { name: 'Spanish', id: '202c50b6-bd64-42cf-98fa-4f35c5d8bb98' }
  ]
}

user =
  User.create!(
    id: user_id,
    username: 'default',
    email: 'test@texterify.com',
    password: 'password',
    password_confirmation: 'password',
    confirmed_at: Time.now.utc
  )
user.skip_confirmation!

(1..1).to_a.each do |organization_number|
  organization = Organization.create!(id: organization_id, name: "organization_#{organization_number}")
  organization.users << user

  project_data =
    (1..11).to_a.map do |project_number|
      {
        id: project_ids[project_number.to_s],
        organization_id: organization.id,
        name: "project_#{project_number}",
        created_at: Time.now.utc,
        updated_at: Time.now.utc
      }
    end
  projects = Project.insert_all!(project_data)

  projects.each do |project|
    ProjectUser.create!(project_id: project['id'], user_id: user.id, role: 'owner')

    if project_languages[project['id']]
      languages_data =
        project_languages[project['id']].to_a.map do |language|
          {
            id: language[:id],
            project_id: project['id'],
            name: language[:name],
            created_at: Time.now.utc,
            updated_at: Time.now.utc
          }
        end

      Language.insert_all!(languages_data)
    end

    keys_data =
      (1..1000).to_a.map do |key_number|
        { project_id: project['id'], name: "key_#{key_number}", created_at: Time.now.utc, updated_at: Time.now.utc }
      end

    Key.insert_all!(keys_data)
  end
end

# rubocop:enable Rails/SkipsModelValidations
