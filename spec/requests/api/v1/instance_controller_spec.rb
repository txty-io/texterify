require 'rails_helper'

RSpec.describe Api::V1::InstanceController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = FactoryBot.create(:user)
      @auth_params = sign_in(@user)

      @user_superadmin = FactoryBot.create(:user)
      @user_superadmin.is_superadmin = true
      @user_superadmin.save!
      @auth_params_superadmin = sign_in(@user_superadmin)

      FactoryBot.create(:project, :with_organization)
      FactoryBot.create(:project, :with_organization)
      FactoryBot.create(:project, :with_organization)
      FactoryBot.create(:organization)
      FactoryBot.create(:organization)
      FactoryBot.create(:organization)
      FactoryBot.create(:organization)
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
end
