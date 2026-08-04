require 'rails_helper'

RSpec.describe Api::V1::OrganizationInvitesController, type: :request do
  it 'does not create a duplicate invite with different capitalization' do
    user = create(:user)
    organization = create(:organization)
    create(:organization_user, organization_id: organization.id, user_id: user.id, role: ROLE_OWNER)
    OrganizationInvite.create!(organization: organization, email: 'example@foo.bar', role: ROLE_TRANSLATOR)

    expect do
      post "/api/v1/organizations/#{organization.id}/invites",
           params: {
             email: 'Example@foo.bar',
             role: ROLE_TRANSLATOR
           },
           headers: sign_in(user),
           as: :json
    end.not_to change(OrganizationInvite, :count)

    expect(response).to have_http_status(:bad_request)
    expect(JSON.parse(response.body)).to include('message' => 'USER_ALREADY_INVITED_OR_ADDED')
  end
end
