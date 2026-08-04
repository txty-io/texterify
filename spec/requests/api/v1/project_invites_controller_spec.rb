require 'rails_helper'

RSpec.describe Api::V1::ProjectInvitesController, type: :request do
  it 'does not create a duplicate invite with different capitalization' do
    user = create(:user)
    project = create(:project, :with_organization)
    create(:project_user, project_id: project.id, user_id: user.id, role: ROLE_OWNER)
    ProjectInvite.create!(project: project, email: 'example@foo.bar', role: ROLE_TRANSLATOR)

    expect do
      post "/api/v1/projects/#{project.id}/invites",
           params: {
             email: 'Example@foo.bar',
             role: ROLE_TRANSLATOR
           },
           headers: sign_in(user),
           as: :json
    end.not_to change(ProjectInvite, :count)

    expect(response).to have_http_status(:bad_request)
    expect(JSON.parse(response.body)).to include('message' => 'USER_ALREADY_INVITED_OR_ADDED')
  end
end
