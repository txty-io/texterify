require 'rails_helper'

RSpec.describe Api::V1::RegistrationsController, type: :request do
  def register(email, username: 'Example')
    post '/api/v1/auth',
         params: {
           username: username,
           email: email,
           password: 'password',
           password_confirmation: 'password'
         },
         as: :json
  end

  before { Setting.sign_up_enabled = false }

  it 'allows an organization invite to sign up with different capitalization' do
    organization = create(:organization)
    invite = OrganizationInvite.create!(organization: organization, email: 'example@foo.bar', role: ROLE_TRANSLATOR)

    register('Example@foo.bar')

    expect(response).to have_http_status(:success)
    user = User.find_by(email: 'example@foo.bar')
    expect(user).to be_present
    user.confirm
    expect(organization.users).to include(user)
    expect(invite.reload).not_to be_open
  end

  it 'allows a project invite to sign up with different capitalization' do
    project = create(:project)
    invite = ProjectInvite.create!(project: project, email: 'example@foo.bar', role: ROLE_TRANSLATOR)

    register('Example@foo.bar')

    expect(response).to have_http_status(:success)
    user = User.find_by(email: 'example@foo.bar')
    expect(user).to be_present
    user.confirm
    expect(project.users).to include(user)
    expect(invite.reload).not_to be_open
  end

  it 'matches an invite that was stored with different capitalization' do
    organization = create(:organization)
    invite = OrganizationInvite.create!(organization: organization, email: 'example@foo.bar', role: ROLE_TRANSLATOR)
    invite.update_column(:email, 'Example@Foo.Bar')

    register('example@foo.bar')

    expect(response).to have_http_status(:success)
    user = User.find_by(email: 'example@foo.bar')
    user.confirm
    expect(organization.users).to include(user)
    expect(invite.reload).not_to be_open
  end

  it 'does not treat a different email address as invited' do
    OrganizationInvite.create!(organization: create(:organization), email: 'example@foo.bar', role: ROLE_TRANSLATOR)

    register('someone-else@foo.bar', username: 'Someone Else')

    expect(response).to have_http_status(:bad_request)
    expect(JSON.parse(response.body)).to include('message' => 'SIGN_UP_NOT_ENABLED')
    expect(User.find_by(email: 'someone-else@foo.bar')).not_to be_present
  end
end
