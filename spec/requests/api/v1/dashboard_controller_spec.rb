require 'rails_helper'

RSpec.describe Api::V1::DashboardController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
  end

  describe 'GET changelog' do
    it 'has status code 403 if not logged in' do
      get '/api/v1/dashboard/changelog'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get '/api/v1/dashboard/changelog', headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['changelog'].length).to be > 0
    end
  end
end
