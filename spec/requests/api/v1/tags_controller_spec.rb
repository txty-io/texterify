require 'rails_helper'

RSpec.describe Api::V1::TagsController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = create(:user)
      @auth_params = sign_in(@user)
      @project = create(:project, :with_organization, :with_business_plan)
      @project_user = ProjectUser.new
      @project_user.project = @project
      @project_user.user = @user
      @project_user.save!
    end
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in' do
      get "/api/v1/projects/#{@project.id}/tags"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get "/api/v1/projects/#{@project.id}/tags", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['included']).to be_nil
      expect(body['meta']['total']).to eq(0)
    end

    it 'has status code 200 and returns data paginated' do
      create(:tag, project_id: @project.id)
      create(:tag, project_id: @project.id)
      create(:tag, project_id: @project.id)
      get "/api/v1/projects/#{@project.id}/tags", headers: @auth_params, params: { per_page: 2 }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(2)
      expect(body['meta']['total']).to eq(3)
      expect(body).to match_snapshot('tags_controller_index_paginated_1', { snapshot_serializer: StripSerializer })

      get "/api/v1/projects/#{@project.id}/tags", headers: @auth_params, params: { per_page: 2, page: 2 }
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(1)
      expect(body['meta']['total']).to eq(3)
      expect(body).to match_snapshot('tags_controller_index_paginated_2', { snapshot_serializer: StripSerializer })

      get "/api/v1/projects/#{@project.id}/tags", headers: @auth_params, params: { per_page: 2, page: 3 }
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(0)
      expect(body['meta']['total']).to eq(3)
      expect(body).to match_snapshot('tags_controller_index_paginated_3', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'POST create' do
    it 'fails to create a new tag without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      name = 'Test Name'
      post "/api/v1/projects/#{@project.id}/tags", params: { name: name }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'fails to create a new tag wihtout name' do
      @project_user.role = 'developer'
      @project_user.save!

      post "/api/v1/projects/#{@project.id}/tags", params: { name: '' }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:bad_request)
    end

    it 'creates a new tag' do
      @project_user.role = 'developer'
      @project_user.save!

      name = 'Test Name'
      post "/api/v1/projects/#{@project.id}/tags", params: { name: name }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body).to match_snapshot('tags_controller_create', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'PUT update' do
    it 'fails to update a tag without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      tag = create(:tag, project_id: @project.id)

      name = 'New Test Name'
      put "/api/v1/projects/#{@project.id}/tags/#{tag.id}", params: { name: name }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'fails to update a tag without name' do
      @project_user.role = 'developer'
      @project_user.save!

      tag = create(:tag, project_id: @project.id)

      put "/api/v1/projects/#{@project.id}/tags/#{tag.id}", params: { name: '' }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:bad_request)
    end

    it 'updates a tag' do
      @project_user.role = 'developer'
      @project_user.save!

      tag = create(:tag, project_id: @project.id)

      name = 'New Test Name'
      expect(tag.name).not_to eq(name)
      put "/api/v1/projects/#{@project.id}/tags/#{tag.id}", params: { name: name }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['attributes']['name']).to eq(name)
      expect(body).to match_snapshot('tags_controller_update', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'DELETE destroy' do
    it 'fails to delete a tag without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      tag = create(:tag, project_id: @project.id)

      delete "/api/v1/projects/#{@project.id}/tags/#{tag.id}", headers: @auth_params, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'deletes a tag' do
      @project_user.role = 'developer'
      @project_user.save!

      tag = create(:tag, project_id: @project.id)

      delete "/api/v1/projects/#{@project.id}/tags/#{tag.id}", headers: @auth_params, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot('tags_controller_destroy', { snapshot_serializer: StripSerializer })
    end
  end
end
