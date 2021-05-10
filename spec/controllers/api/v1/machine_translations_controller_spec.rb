require 'rails_helper'

RSpec.describe Api::V1::MachineTranslationsController, type: :request do
  skip 'is skipped' do
    before(:each) do |test|
      unless test.metadata[:skip_before]
        @user = FactoryBot.create(:user)
        @auth_params = sign_in(@user)

        @user_superadmin = FactoryBot.create(:user)
        @user_superadmin.is_superadmin = true
        @user_superadmin.save!
        @auth_params_superadmin = sign_in(@user_superadmin)
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
        expect(response.status).to eq(403)
      end

      it 'has status code 403 if not super admin', :skip_before do
        get '/api/v1/machine_translations_usage', headers: @auth_params
        expect(response.status).to eq(403)
      end

      it 'has status code 200 if super admin' do
        get '/api/v1/machine_translations_usage', headers: @auth_params_superadmin
        expect(response.status).to eq(200)
        body = JSON.parse(response.body)
        expect(body['character_count']).to be_a_kind_of(Integer)
        expect(body['character_limit']).to be_a_kind_of(Integer)
      end
    end

    describe 'GET target_languages' do
      it 'has status code 403 if not logged in', :skip_before do
        get '/api/v1/machine_translations_target_languages'
        expect(response.status).to eq(403)
      end

      it 'has status code 403 if not super admin', :skip_before do
        get '/api/v1/machine_translations_target_languages', headers: @auth_params
        expect(response.status).to eq(403)
      end

      it 'has status code 200 if super admin' do
        get '/api/v1/machine_translations_target_languages', headers: @auth_params_superadmin
        expect(response.status).to eq(200)
        body = JSON.parse(response.body)
        expect(body).to be_a_kind_of(Array)
        expect(body[0]['language']).to be_a_kind_of(String)
        expect(body[0]['name']).to be_a_kind_of(String)
      end
    end

    describe 'GET source_languages' do
      it 'has status code 403 if not logged in', :skip_before do
        get '/api/v1/machine_translations_source_languages'
        expect(response.status).to eq(403)
      end

      it 'has status code 403 if not super admin', :skip_before do
        get '/api/v1/machine_translations_source_languages', headers: @auth_params
        expect(response.status).to eq(403)
      end

      it 'has status code 200 if super admin' do
        get '/api/v1/machine_translations_source_languages', headers: @auth_params_superadmin
        expect(response.status).to eq(200)
        body = JSON.parse(response.body)
        expect(body).to be_a_kind_of(Array)
        expect(body[0]['language']).to be_a_kind_of(String)
        expect(body[0]['name']).to be_a_kind_of(String)
      end
    end

    describe 'POST translate' do
      it 'has status code 403 if not logged in', :skip_before do
        get '/api/v1/machine_translations_source_languages'
        expect(response.status).to eq(403)
      end

      it 'has status code 200' do
        get '/api/v1/machine_translations_source_languages', headers: @auth_params
        expect(response.status).to eq(200)
        body = JSON.parse(response.body)
        expect(body).to be_a_kind_of(Array)
        expect(body[0]['language']).to be_a_kind_of(String)
        expect(body[0]['name']).to be_a_kind_of(String)
      end
    end
  end
end
