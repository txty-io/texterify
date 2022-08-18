require 'rails_helper'

RSpec.describe Api::V1::ForbiddenWordsListsController, type: :request do
  before(:each) do
    @user = FactoryBot.create(:user)
    @auth_params = sign_in(@user)
    @project = FactoryBot.create(:project, :with_organization)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'owner'
    project_user.save!
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/forbidden_words_lists"
      expect(response.status).to eq(403)
    end

    it 'returns empty data' do
      get "/api/v1/projects/#{@project.id}/forbidden_words_lists", headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['included']).to eq([])
      expect(body['meta']['total']).to eq(0)
    end

    it 'returns forbidden words lists' do
      @project.name = 'My project'
      @project.save!

      fwl = ForbiddenWordsList.new
      fwl.project = @project
      fwl.name = 'my name'
      fwl.content = 'my content'
      fwl.save!

      get "/api/v1/projects/#{@project.id}/forbidden_words_lists", headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['data'][0]['attributes']['content']).to eq('my content')
      expect(body).to match_snapshot('forbidden_words_lists_index', { snapshot_serializer: StripSerializer })
    end
  end

  describe 'POST create' do
    it 'has status code 403 if not logged in', :skip_before do
      post "/api/v1/projects/#{@project.id}/forbidden_words_lists"
      expect(response.status).to eq(403)
    end

    it 'creates a forbidden words list' do
      post "/api/v1/projects/#{@project.id}/forbidden_words_lists",
           params: {
             name: 'my name',
             content: 'my content'
           },
           headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to be(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_CREATED')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('my name')
      expect(ForbiddenWordsList.first.content).to eq('my content')
    end
  end

  describe 'PUT update' do
    before(:each) do
      @fwl = ForbiddenWordsList.new
      @fwl.project = @project
      @fwl.name = 'my name'
      @fwl.content = 'my content'
      @fwl.save!
    end

    it 'has status code 403 if not logged in', :skip_before do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}"
      expect(response.status).to eq(403)
    end

    it 'updates a forbidden words list' do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}",
          params: {
            name: 'new name',
            content: 'new content'
          },
          headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to be(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_UPDATED')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('new name')
      expect(ForbiddenWordsList.first.content).to eq('new content')
    end

    it 'does not update a forbidden words list with missing name' do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}",
          params: {
            name: nil
          },
          headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)

      expect(body['error']).to be(true)
    end
  end

  describe 'DELETE destroy' do
    before(:each) do
      @fwl = ForbiddenWordsList.new
      @fwl.project = @project
      @fwl.name = 'my name'
      @fwl.content = 'my content'
      @fwl.save!
    end

    it 'has status code 403 if not logged in', :skip_before do
      delete "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}"
      expect(response.status).to eq(403)
    end

    it 'deletes a forbidden words list' do
      delete "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}", params: {}, headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to be(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_DELETED')
      expect(ForbiddenWordsList.count).to eq(0)
    end

    it 'fails to delete an invalid forbidden words list' do
      delete "/api/v1/projects/#{@project.id}/forbidden_words_lists/003c48bf-4fd2-46a8-9b2e-e95da7e28646",
             params: {},
             headers: @auth_params
      expect(response.status).to eq(404)
      expect(ForbiddenWordsList.count).to eq(1)
    end
  end
end
