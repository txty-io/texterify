require 'rails_helper'

RSpec.describe Api::V1::UsersController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = FactoryBot.create(:user)
      @auth_params = sign_in(@user)

      @user_confirmed = FactoryBot.create(:user)
      @user_confirmed.confirmed_at = Time.now.utc
      @user_confirmed.save!
      @auth_params_confirmed = sign_in(@user_confirmed)
    end
  end

  describe 'responds with' do
    it 'responds with json by default' do
      get '/api/v1/users/info'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get '/api/v1/users/info', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/users/info'
      expect(response.status).to eq(403)
    end

    it 'returns current user info with confirmed false for unconfirmed user' do
      get '/api/v1/users/info', headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['confirmed']).to eq(false)
    end

    it 'returns current user info with confirmed true for confirmed user' do
      get '/api/v1/users/info', headers: @auth_params_confirmed
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['confirmed']).to eq(true)
    end
  end
end
