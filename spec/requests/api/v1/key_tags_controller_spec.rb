require 'rails_helper'

RSpec.describe Api::V1::KeyTagsController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
    @project = create(:project, :with_organization, :with_business_plan)
    @key = create(:key, project_id: @project.id)
    @tag = create(:tag, project_id: @project.id)
    @tag_already_added = create(:tag, project_id: @project.id)
    @tag_already_added_key_tag = create(:key_tag, key_id: @key.id, tag_id: @tag_already_added.id)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'developer'
    project_user.save!
  end

  describe 'POST create' do
    it 'adds a tag to a key' do
      post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags",
           params: {
             tag_id: @tag.id
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['error']).to be(false)
      expect(body['message']).to eq('TAG_ADDED_TO_KEY')
    end

    it 'fails to add a tag to an invalid project' do
      post "/api/v1/projects/f05a83c1-85a5-420b-a536-40547056a86b/keys/#{@key.id}/tags",
           params: {
             tag_id: @tag.id
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'project' => 'not_found' })
    end

    it 'fails to add a tag to an invalid key' do
      post "/api/v1/projects/#{@project.id}/keys/43da4ad9-88ac-47b2-ba71-4195eec3206f/tags",
           params: {
             tag_id: @tag.id
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'key' => 'not_found' })
    end

    it 'fails to add an invalid tag' do
      post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags",
           params: {
             tag_id: 'd3309b6a-0a87-47c8-b71e-e31640159751'
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'tag' => 'not_found' })
    end

    it 'fails to add the same tag to a key twice' do
      post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags",
           params: {
             tag_id: @tag.id
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['error']).to be(false)
      expect(body['message']).to eq('TAG_ADDED_TO_KEY')

      post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags",
           params: {
             tag_id: @tag.id
           },
           headers: @auth_params,
           as: :json
      expect(response).to have_http_status(:conflict)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('TAG_HAS_ALREADY_BEEN_ADDED')
    end
  end

  describe 'DELETE destroy' do
    it 'removes a tag from a key' do
      delete "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags/#{@tag_already_added.id}",
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['error']).to be(false)
      expect(body['message']).to eq('TAG_REMOVED_FROM_KEY')
    end

    it 'fails to remove a tag from an invalid project' do
      delete "/api/v1/projects/c3c1d669-8dba-4b1a-8743-47b4f7350f6a/keys/#{@key.id}/tags/#{@tag_already_added.id}",
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'project' => 'not_found' })
    end

    it 'fails to remove a tag from an invalid key' do
      delete "/api/v1/projects/#{@project.id}/keys/2b3e1dec-23d5-47e2-8402-545923e4d33d/tags/#{@tag_already_added.id}",
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'key' => 'not_found' })
    end

    it 'fails to remove an invalid tag' do
      delete "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags/02e702a5-a777-48a2-a42f-f5d1006c075f",
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'tag' => 'not_found' })
    end

    it 'fails to remove the same tag from a key twice' do
      delete "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags/#{@tag_already_added.id}",
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['error']).to be(false)
      expect(body['message']).to eq('TAG_REMOVED_FROM_KEY')

      delete "/api/v1/projects/#{@project.id}/keys/#{@key.id}/tags/#{@tag_already_added.id}",
             headers: @auth_params,
             as: :json
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('NOT_FOUND')
      expect(body['details']).to eq({ 'key_tag' => 'not_found' })
    end
  end
end
