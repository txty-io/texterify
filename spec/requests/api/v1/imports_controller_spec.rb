require 'rails_helper'

RSpec.describe Api::V1::ImportsController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
    @project = create(:project, :with_organization, :with_business_plan)
    @import = create(:import, project: @project)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'owner'
    project_user.save!
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/imports"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get "/api/v1/projects/#{@project.id}/imports", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to be_a(Array)
      expect(body['included']).to be_a(Array)
      expect(body['meta']['total']).to eq(1)
    end
  end

  describe 'GET show' do
    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/imports/#{@import.id}"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get "/api/v1/projects/#{@project.id}/imports/#{@import.id}", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot('imports_controller_show', { snapshot_serializer: StripSerializer })
    end
  end
end
