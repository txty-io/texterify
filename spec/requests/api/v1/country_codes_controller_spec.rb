require 'rails_helper'

RSpec.describe Api::V1::CountryCodesController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/country_codes'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 if logged in' do
      get '/api/v1/country_codes', headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(249)
    end
  end
end
