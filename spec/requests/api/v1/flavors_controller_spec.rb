require 'rails_helper'

RSpec.describe Api::V1::FlavorsController, type: :request do
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
      get "/api/v1/projects/#{@project.id}/flavors"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get "/api/v1/projects/#{@project.id}/flavors", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['included']).to be_nil
      expect(body['meta']['total']).to eq(0)
    end

    it 'has status code 200 and returns data paginated' do
      create(:flavor, project_id: @project.id)
      create(:flavor, project_id: @project.id)
      create(:flavor, project_id: @project.id)
      get "/api/v1/projects/#{@project.id}/flavors", headers: @auth_params, params: { per_page: 2 }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(2)
      expect(body['meta']['total']).to eq(3)
      expect(body).to match_snapshot('flavors_controller_index_paginated_1', { snapshot_serializer: StripSerializer })

      get "/api/v1/projects/#{@project.id}/flavors", headers: @auth_params, params: { per_page: 2, page: 2 }
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(1)
      expect(body['meta']['total']).to eq(3)
      expect(body).to match_snapshot('flavors_controller_index_paginated_2', { snapshot_serializer: StripSerializer })

      get "/api/v1/projects/#{@project.id}/flavors", headers: @auth_params, params: { per_page: 2, page: 3 }
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(0)
      expect(body['meta']['total']).to eq(3)
      expect(body).to match_snapshot('flavors_controller_index_paginated_3', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'POST create' do
    it 'fails to create a new flavor without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      name = 'Test Name'
      post "/api/v1/projects/#{@project.id}/flavors", params: { name: name }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'fails to create a new flavor wihtout name' do
      @project_user.role = 'developer'
      @project_user.save!

      post "/api/v1/projects/#{@project.id}/flavors", params: { name: '' }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:bad_request)
    end

    it 'creates a new flavor' do
      @project_user.role = 'developer'
      @project_user.save!

      name = 'Test Name'
      file_path = 'file_path'
      file_format = 'file_format'
      post "/api/v1/projects/#{@project.id}/flavors",
           params: {
             name: name,
             file_path: file_path,
             file_format: file_format
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body).to match_snapshot('flavors_controller_create', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'PUT update' do
    it 'fails to update an flavor without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      flavor = create(:flavor, project_id: @project.id)

      name = 'New Test Name'
      put "/api/v1/projects/#{@project.id}/flavors/#{flavor.id}",
          params: {
            name: name
          },
          headers: @auth_params,
          as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'fails to update an flavor without name' do
      @project_user.role = 'developer'
      @project_user.save!

      flavor = create(:flavor, project_id: @project.id)

      put "/api/v1/projects/#{@project.id}/flavors/#{flavor.id}", params: { name: '' }, headers: @auth_params, as: :json
      expect(response).to have_http_status(:bad_request)
    end

    it 'updates an flavor' do
      @project_user.role = 'developer'
      @project_user.save!

      flavor = create(:flavor, project_id: @project.id)

      name = 'New Test Name'
      expect(flavor.name).not_to eq(name)
      put "/api/v1/projects/#{@project.id}/flavors/#{flavor.id}",
          params: {
            name: name,
            disable_translation_for_translators: true
          },
          headers: @auth_params,
          as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['attributes']['name']).to eq(name)
      expect(body).to match_snapshot('flavors_controller_update', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'DELETE destroy' do
    it 'fails to delete an flavor without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      flavor = create(:flavor, project_id: @project.id)

      delete "/api/v1/projects/#{@project.id}/flavors/#{flavor.id}", headers: @auth_params, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'deletes an flavor' do
      @project_user.role = 'developer'
      @project_user.save!

      flavor = create(:flavor, project_id: @project.id)

      delete "/api/v1/projects/#{@project.id}/flavors/#{flavor.id}", headers: @auth_params, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot('flavors_controller_destroy', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'DELETE destroy_multiple' do
    it 'fails to delete an flavor without permissions' do
      @project_user.role = 'translator'
      @project_user.save!

      flavor1 = create(:flavor, project_id: @project.id)
      flavor2 = create(:flavor, project_id: @project.id)

      delete "/api/v1/projects/#{@project.id}/flavors",
             params: {
               flavors: [flavor1.id, flavor2.id]
             },
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it 'deletes multiple flavors' do
      @project_user.role = 'developer'
      @project_user.save!

      flavor1 = create(:flavor, project_id: @project.id)
      flavor2 = create(:flavor, project_id: @project.id)

      delete "/api/v1/projects/#{@project.id}/flavors",
             params: {
               flavors: [flavor1.id, flavor2.id]
             },
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot('flavors_controller_destroy_multiple', { snapshot_serializer: StripSerializer })
    end
  end
end
