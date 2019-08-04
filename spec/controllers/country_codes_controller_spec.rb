require 'rails_helper'

RSpec.describe Api::V1::CountryCodesController, type: :request do
  before(:each) do
    @user = FactoryBot.create(:user)
    @auth_params = sign_in(@user)
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get '/api/v1/country_codes'
      expect(response.content_type).to eq 'application/json'
    end

    it 'responds with json even by set format' do
      get '/api/v1/country_codes', params: { format: :html }
      expect(response.content_type).to eq 'application/json'
    end
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/country_codes'
      expect(response.status).to eq(403)
    end

    it 'has status code 200 if logged in' do
      get '/api/v1/country_codes', headers: @auth_params
      body = JSON.parse(response.body)
      expect(response.status).to eq(200)
      expect(body['data'].length).to eq(249)
    end
  end
end
