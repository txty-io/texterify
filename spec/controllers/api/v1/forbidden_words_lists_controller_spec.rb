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
      fwl = ForbiddenWordsList.new
      fwl.id = '83dceff3-a228-4fe7-871e-f7519cd22413'
      fwl.project = @project
      fwl.name = 'my name'
      fwl.content = 'my content'
      fwl.save!

      get "/api/v1/projects/#{@project.id}/forbidden_words_lists", headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['data'][0]['attributes']['content']).to eq('my content')
      expect(body).to match_snapshot('forbidden_words_lists_index')
    end
  end

  describe 'POST create' do
    it 'has status code 403 if not logged in', :skip_before do
      post "/api/v1/projects/#{@project.id}/forbidden_words_lists"
      expect(response.status).to eq(403)
    end

    it 'creates a forbidden words list without language' do
      post "/api/v1/projects/#{@project.id}/forbidden_words_lists",
           params: {
             name: 'my name',
             content: 'my content'
           },
           headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_CREATED')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('my name')
      expect(ForbiddenWordsList.first.content).to eq('my content')
      expect(ForbiddenWordsList.first.language_id).to eq(nil)
    end

    it 'creates a forbidden words list with language' do
      language = Language.new
      language.name = 'my_lang'
      language.project = @project
      language.save!

      post "/api/v1/projects/#{@project.id}/forbidden_words_lists",
           params: {
             name: 'my name',
             content: 'my content',
             language_id: language.id
           },
           headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_CREATED')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('my name')
      expect(ForbiddenWordsList.first.content).to eq('my content')
      expect(ForbiddenWordsList.first.language_id).to eq(language.id)
    end

    it 'does not create a forbidden words list with invalid language' do
      post "/api/v1/projects/#{@project.id}/forbidden_words_lists",
           params: {
             name: 'my name',
             content: 'my content',
             language_id: '0aa4bcf6-2cb2-4c72-bc09-d8452fb5be3e'
           },
           headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(true)
      expect(body['details']).to eq('LANGUAGE_NOT_FOUND')
      expect(ForbiddenWordsList.count).to eq(0)
    end
  end

  describe 'PUT update' do
    before(:each) do
      @fwl = ForbiddenWordsList.new
      @fwl.project = @project
      @fwl.name = 'my name'
      @fwl.content = 'my content'
      @fwl.save!

      @language = Language.new
      @language.name = 'my_lang'
      @language.project = @project
      @language.save!
    end

    it 'has status code 403 if not logged in', :skip_before do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}"
      expect(response.status).to eq(403)
    end

    it 'updates a forbidden words list and sets new language' do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}",
          params: {
            name: 'new name',
            content: 'new content',
            language_id: @language.id
          },
          headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_UPDATED')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('new name')
      expect(ForbiddenWordsList.first.content).to eq('new content')
      expect(ForbiddenWordsList.first.language_id).to eq(@language.id)
    end

    it 'does not update a forbidden words list with invalid language' do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}",
          params: {
            name: 'new name',
            content: 'new content',
            language_id: '46b501f5-cf00-45f6-999b-2cd62932c739'
          },
          headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(true)
      expect(body['details']).to eq('LANGUAGE_NOT_FOUND')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('my name')
      expect(ForbiddenWordsList.first.content).to eq('my content')
      expect(ForbiddenWordsList.first.language_id).to eq(nil)
    end

    it 'updates a forbidden words list and remove existing language' do
      @fwl.language = @language
      @fwl.save!

      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}",
          params: {
            name: 'new name',
            content: 'new content',
            language_id: nil
          },
          headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(false)
      expect(body['details']).to eq('FORBIDDEN_WORDS_LIST_UPDATED')
      expect(ForbiddenWordsList.count).to eq(1)
      expect(ForbiddenWordsList.first.name).to eq('new name')
      expect(ForbiddenWordsList.first.content).to eq('new content')
      expect(ForbiddenWordsList.first.language_id).to eq(nil)
    end

    it 'does not update a forbidden words list with missing name' do
      put "/api/v1/projects/#{@project.id}/forbidden_words_lists/#{@fwl.id}",
          params: {
            name: nil
          },
          headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)

      expect(body['error']).to eq(true)
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

      expect(body['error']).to eq(false)
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
