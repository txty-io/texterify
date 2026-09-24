require 'rails_helper'

RSpec.describe Api::V1::TranslationsController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)

    @project = create(:project, :with_organization, :with_business_plan)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'developer'
    project_user.save!

    @language = create(:language, project_id: @project.id)
    @key = create(:key, project_id: @project.id)
  end

  describe 'POST create' do
    it 'returns forbidden for a disabled project' do
      @project.update!(disabled: true)

      post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/translations",
           params: {
             translation: {
               content: 'Hello world'
             },
             language_id: @language.id
           },
           headers: @auth_params,
           as: :json

      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['error_type']).to eq('PROJECT_IS_DISABLED')
    end

    it 'creates a translation when a language is provided' do
      expect do
        post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/translations",
             params: {
               translation: {
                 content: 'Hello world'
               },
               language_id: @language.id
             },
             headers: @auth_params,
             as: :json
      end.to change(Translation, :count).by(1)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['attributes']['content']).to eq('Hello world')
      expect(body['data']['relationships']['language']['data']['id']).to eq(@language.id)
      expect(body['data']['relationships']['key']['data']['id']).to eq(@key.id)
    end

    it 'returns bad request when no default language is available' do
      post "/api/v1/projects/#{@project.id}/keys/#{@key.id}/translations",
           params: {
             translation: {
               content: 'Hello world'
             }
           },
           headers: @auth_params,
           as: :json

      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['error']).to eq('NO_DEFAULT_LANGUAGE_SPECIFIED')
    end
  end
end
