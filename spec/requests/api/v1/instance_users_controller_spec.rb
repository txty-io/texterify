require 'rails_helper'

RSpec.describe Api::V1::InstanceUsersController, type: :request do
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

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/instance/users'
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 403 if not logged in as superadmin' do
      get '/api/v1/instance/users', headers: @auth_params
      expect(response).to have_http_status(:forbidden)
    end

    it 'returns instance users' do
      get '/api/v1/instance/users', headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body['meta']['total']).to eq(2)
      expect(body['data'][0]['attributes']['username']).to eq('Test User 2')
    end

    it 'returns correct instance users with search' do
      get '/api/v1/instance/users?search=2', headers: @auth_params_superadmin
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body['meta']['total']).to eq(1)
      expect(body['data'][0]['attributes']['username']).to eq('Test User 2')
    end
  end
end
