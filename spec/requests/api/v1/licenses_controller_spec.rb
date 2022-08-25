require 'rails_helper'

RSpec.describe Api::V1::LicensesController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = FactoryBot.create(:user)
      @auth_params = sign_in(@user)

      @user_superadmin = FactoryBot.create(:user)
      @user_superadmin.is_superadmin = true
      @user_superadmin.save!
      @auth_params_superadmin = sign_in(@user_superadmin)

      @license = FactoryBot.create(:license)
    end
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get '/api/v1/licenses'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get '/api/v1/licenses', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/licenses'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 403 if not logged in as superadmin' do
      get '/api/v1/licenses', headers: @auth_params
      expect(response).to have_http_status(:forbidden)
    end

    it 'returns all licenses' do
      FactoryBot.create(:license)
      FactoryBot.create(:license)

      get '/api/v1/licenses', headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to be_a(Array)
      expect(body['meta']['total']).to eq(3)
    end
  end

  describe 'POST create' do
    it 'has status code 403 if not logged in', :skip_before do
      post '/api/v1/licenses'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 403 if not logged in as superadmin' do
      post '/api/v1/licenses', headers: @auth_params
      expect(response).to have_http_status(:forbidden)
    end

    it 'creates a new license from data' do
      license = FactoryBot.build(:license)

      post '/api/v1/licenses', params: { data: license.data }, headers: @auth_params_superadmin, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['id']).to be_a(String)
      expect(body['data']['attributes']['data']).to be_a(String)
    end
  end

  describe 'DELETE destroy' do
    it 'has status code 403 if not logged in', :skip_before do
      license = FactoryBot.create(:license)
      delete "/api/v1/licenses/#{license.id}"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 403 if not logged in as superadmin' do
      delete "/api/v1/licenses/#{@license.id}", headers: @auth_params
      expect(response).to have_http_status(:forbidden)
    end

    it 'deletes a license' do
      expect(License.all.size).to eq(1)
      delete "/api/v1/licenses/#{@license.id}", headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['message']).to eq('License deleted')
      expect(License.all.size).to eq(0)
    end
  end
end
