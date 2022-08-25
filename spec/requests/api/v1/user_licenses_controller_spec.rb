require 'rails_helper'

RSpec.describe Api::V1::UserLicensesController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get '/api/v1/user_licenses'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get '/api/v1/user_licenses', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/user_licenses'
      expect(response).to have_http_status(:forbidden)
    end

    it 'returns the licenses of the user' do
      create(:user_license, user: @user)
      create(:user_license, user: @user)
      create(:user_license, user: @user)
      create(:user_license, user: create(:user))

      get '/api/v1/user_licenses', headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to be_a(Array)
      expect(body['meta']['total']).to eq(3)
    end
  end
end
