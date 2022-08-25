require 'rails_helper'

RSpec.describe Api::V1::PostProcessingRulesController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
    @project = create(:project, :with_organization)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'owner'
    project_user.save!
  end

  describe 'GET index' do
    it 'responds with json by default' do
      get "/api/v1/projects/#{@project.id}/post_processing_rules"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get "/api/v1/projects/#{@project.id}/post_processing_rules", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/post_processing_rules"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in and returns empty array' do
      get "/api/v1/projects/#{@project.id}/post_processing_rules", headers: @auth_params

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['meta']['total']).to eq(0)
    end
  end
end
