require 'rails_helper'

RSpec.describe Api::V1::LanguagesController, type: :request do
  before(:each) do
    @user = FactoryBot.create(:user)
    @auth_params = sign_in(@user)
    @project = FactoryBot.create(:project, :with_organization, :with_business_plan)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'owner'
    project_user.save!
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get "/api/v1/projects/#{@project.id}/languages"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get "/api/v1/projects/#{@project.id}/languages", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/languages"
      expect(response.status).to eq(403)
    end

    it 'has status code 200 if logged in' do
      get "/api/v1/projects/#{@project.id}/languages", headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['included']).to eq([])
      expect(body['meta']['total']).to eq(0)
    end
  end

  describe 'POST create' do
    it 'responds with json by default' do
      post "/api/v1/projects/#{@project.id}/languages"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      post "/api/v1/projects/#{@project.id}/languages", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'creates a new language' do
      name = 'German'
      post "/api/v1/projects/#{@project.id}/languages", params: { name: name }, headers: @auth_params, as: :json
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['success']).to eq(true)
      expect(body['details']).to eq('Language successfully created.')
    end

    it 'creates a new language and activates the language for all users' do
      expect(ProjectColumn.all.size).to eq(0)
      expect(LanguageProjectColumn.all.size).to eq(0)

      name = 'German'
      post "/api/v1/projects/#{@project.id}/languages", params: { name: name }, headers: @auth_params, as: :json

      expect(ProjectColumn.all.size).to eq(1)
      expect(LanguageProjectColumn.all.size).to eq(1)

      name = 'English'
      post "/api/v1/projects/#{@project.id}/languages", params: { name: name }, headers: @auth_params, as: :json

      expect(ProjectColumn.all.size).to eq(1)
      expect(LanguageProjectColumn.all.size).to eq(2)
    end

    it 'creates a new language and auto-translates existing translations' do
      user = FactoryBot.create(:user)
      auth_params = sign_in(user)
      project =
        FactoryBot.create(
          :project,
          :with_organization,
          :with_business_plan,
          :with_default_language_keys_and_translations
        )
      project.auto_translate_new_languages = true
      project.save!

      project_user = ProjectUser.new
      project_user.project = project
      project_user.user = user
      project_user.role = 'owner'
      project_user.save!

      expect(project.organization.machine_translation_character_usage).to eq(0)
      expect(project.machine_translation_character_usage).to eq(0)
      expect(project.translations.size).to eq(4)
      expect(project.languages.size).to eq(1)

      post "/api/v1/projects/#{project.id}/languages",
           params: {
             name: 'my_new_language',
             language_code: LanguageCode.find_by(code: 'de').id
           },
           headers: auth_params,
           as: :json

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['success']).to eq(true)
      expect(body['details']).to eq('Language successfully created.')
      expect(project.translations.size).to eq(8)
      expect(project.languages.size).to eq(2)

      # Check if the organization and project translation character usage has been updated.
      project.reload
      expect(project.machine_translation_character_usage).to eq('Translation X'.size * 4)
    end
  end
end
