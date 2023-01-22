require 'rails_helper'

RSpec.describe Api::V1::KeysController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
    @project = create(:project, :with_organization, :with_business_plan)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'owner'
    project_user.save!
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/keys"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get "/api/v1/projects/#{@project.id}/keys", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['included']).to eq([])
      expect(body['meta']['total']).to eq(0)
    end
  end

  describe 'POST create' do
    it 'creates a new key' do
      name = 'German'
      post "/api/v1/projects/#{@project.id}/keys", params: { name: name }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot('keys_controller_create', { snapshot_serializer: StripSerializer })
    end
  end
end
