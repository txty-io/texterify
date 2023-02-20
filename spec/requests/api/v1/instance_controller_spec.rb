require 'rails_helper'

RSpec.describe Api::V1::InstanceController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = create(:user)
      @auth_params = sign_in(@user)

      @user_superadmin = create(:user)
      @user_superadmin.is_superadmin = true
      @user_superadmin.save!
      @auth_params_superadmin = sign_in(@user_superadmin)

      create(:project, :with_organization)
      create(:project, :with_organization)
      create(:project, :with_organization)
      create(:organization)
      create(:organization)
      create(:organization)
      create(:organization)
    end
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get '/api/v1/instance'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get '/api/v1/instance', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end
  end

  describe 'GET show' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/instance'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 403 if not logged in as superadmin' do
      get '/api/v1/instance', headers: @auth_params
      expect(response).to have_http_status(:forbidden)
    end

    it 'returns instance information' do
      get '/api/v1/instance', headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['users_count']).to eq(2)
      expect(body['projects_count']).to eq(3)
      expect(body['organizations_count']).to eq(7)
      expect(body['languages_count']).to eq(0)
      expect(body['keys_count']).to eq(0)
      expect(body['translations_count']).to eq(0)
      expect(body['releases_count']).to eq(0)
    end
  end

  describe 'GET debug' do
    it 'has status code 403 if no debug secret is set' do
      get '/api/v1/instance/debug'
      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot(
        'instance_controller_debug_secret_not_set',
        { snapshot_serializer: StripSerializer }
      )
    end

    it 'has status code 403 if debug secret does not match' do
      ENV['DEBUG_SECRET'] = 'other secret'
      get '/api/v1/instance/debug', params: { secret: 'debug secret' }
      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot(
        'instance_controller_debug_invalid_secret',
        { snapshot_serializer: StripSerializer }
      )
    end

    it 'returns debug information' do
      ENV['DEBUG_SECRET'] = 'debug secret'
      get '/api/v1/instance/debug', params: { secret: 'debug secret' }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot('instance_controller_debug_ok', { snapshot_serializer: StripSerializer })
    end
  end
end
