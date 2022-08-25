require 'rails_helper'

RSpec.describe Api::V1::MachineTranslationsController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = FactoryBot.create(:user)
      @auth_params = sign_in(@user)

      @user_superadmin = FactoryBot.create(:user)
      @user_superadmin.is_superadmin = true
      @user_superadmin.save!
      @auth_params_superadmin = sign_in(@user_superadmin)

      @source_language = DeeplSourceLanguage.new
      @source_language.name = 'Source language 1'
      @source_language.language_code = 'en'
      @source_language.country_code = 'US'
      @source_language.save!

      @target_language = DeeplTargetLanguage.new
      @target_language.name = 'Target language 1'
      @target_language.language_code = 'en'
      @target_language.country_code = 'US'
      @target_language.save!

      ENV['DEEPL_API_TOKEN'] = '<valid_free_token>'
    end
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get '/api/v1/machine_translations_usage'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get '/api/v1/machine_translations_usage', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end
  end

  describe 'GET usage' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/machine_translations_usage'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 403 if not super admin' do
      get '/api/v1/machine_translations_usage', headers: @auth_params
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 400 if token not set' do
      ENV['DEEPL_API_TOKEN'] = nil

      get '/api/v1/machine_translations_usage', headers: @auth_params
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('MACHINE_TRANSLATION_TOKEN_NOT_CONFIGURED')
    end

    it 'has status code 200 if super admin with free token' do
      ENV['DEEPL_API_TOKEN'] = '<valid_free_token>'

      get '/api/v1/machine_translations_usage', headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['character_count']).to be_a_kind_of(Integer)
      expect(body['character_limit']).to be_a_kind_of(Integer)
    end

    it 'has status code 200 if super admin with api token' do
      ENV['DEEPL_API_TOKEN'] = '<valid_pro_token>'

      get '/api/v1/machine_translations_usage', headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['character_count']).to be_a_kind_of(Integer)
      expect(body['character_limit']).to be_a_kind_of(Integer)
    end

    it 'returns an error for invalid token' do
      ENV['DEEPL_API_TOKEN'] = 'invalid token'

      get '/api/v1/machine_translations_usage', headers: @auth_params_superadmin
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('MACHINE_TRANSLATION_INVALID_TOKEN')
    end
  end

  describe 'GET target_languages' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/machine_translations_target_languages'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 400 if token not set' do
      ENV['DEEPL_API_TOKEN'] = nil

      get '/api/v1/machine_translations_target_languages', headers: @auth_params
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('MACHINE_TRANSLATION_TOKEN_NOT_CONFIGURED')
    end

    it 'has status code 200' do
      get '/api/v1/machine_translations_target_languages', headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data'][0]['attributes']['name']).to eq(@target_language.name)
    end
  end

  describe 'GET source_languages' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/machine_translations_source_languages'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 400 if token not set' do
      ENV['DEEPL_API_TOKEN'] = nil

      get '/api/v1/machine_translations_source_languages', headers: @auth_params
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['message']).to eq('MACHINE_TRANSLATION_TOKEN_NOT_CONFIGURED')
    end

    it 'has status code 200' do
      get '/api/v1/machine_translations_source_languages', headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data'][0]['attributes']['name']).to eq(@source_language.name)
    end
  end
end
