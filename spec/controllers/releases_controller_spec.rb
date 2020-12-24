require 'rails_helper'

RSpec.describe Api::V1::ReleasesController, type: :request do
  before(:each) do
    @user = FactoryBot.create(:user)
    @auth_params = sign_in(@user)
    @project = FactoryBot.create(:project)
    @export_config = FactoryBot.create(:export_config, project_id: @project.id)
    @export_config.save!
  end

  describe 'GET release' do
    it 'responds with json by default' do
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'has status code 400 if no releases are available' do
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release"
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'NO_RELEASES_FOUND' }])
    end

    it 'has status code 400 if releases are available but no locale was given' do
      FactoryBot.create(:release, export_config_id: @export_config.id)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release"
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'NO_LOCALE_GIVEN' }])
    end

    it 'has status code 304 if no release file for locale was found' do
      FactoryBot.create(:release, export_config_id: @export_config.id)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT"
      expect(response.status).to eq(304)
    end

    it 'has status code 302 if release file for locale was found' do
      FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT"
      expect(response.status).to eq(302)
    end

    it 'has status code 302 if release file for locale was found #1' do
      release = FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de"
      expect(response.status).to eq(302)
      expect(response).to redirect_to(release.release_files[0].url)
    end

    it 'has status code 302 if release file for locale was found #2' do
      release = FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de"
      expect(response.status).to eq(302)
      expect(response).to redirect_to(release.release_files[0].url)
    end

    it 'has status code 302 if release file for locale was found #3' do
      release = FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-DE"
      expect(response.status).to eq(302)
      expect(response).to redirect_to(release.release_files[0].url)
    end

    it 'has status code 302 if release file for locale was found #4' do
      FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }, { language_code: 'de', country_code: 'DE' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-DE"
      expect(response.status).to eq(302)
      expect(response).to redirect_to(%r{http://localhost/url-de-DE-.})
    end

    it 'has status code 304 if timestamp is in the future' do
      FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      time = Time.now.utc
      timestamp = time.iso8601
      timestamp_10_minutes_in_future = (time + 10 * 60).iso8601
      FactoryBot.create(:release, export_config_id: @export_config.id, timestamp: timestamp, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{timestamp_10_minutes_in_future}"
      expect(response.status).to eq(304)
    end

    it 'has status code 304 if timestamp is equal to latest release timestamp' do
      FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      release = FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }], timestamp: (Time.now.utc + 10 * 60).iso8601)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{release.timestamp}"
      expect(response.status).to eq(304)
    end

    it 'has status code 302 if timestamp is equal to old release timestamp' do
      old_release = FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }], timestamp: (Time.now.utc + 10 * 60).iso8601)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{old_release.timestamp}"
      expect(response.status).to eq(302)
    end

    it 'has status code 304 if timestamp is equal to old release timestamp but locale is not available anymore in new release' do
      old_release = FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      FactoryBot.create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'en' }], timestamp: (Time.now.utc + 10 * 60).iso8601)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{old_release.timestamp}"
      expect(response.status).to eq(304)
    end
  end
end
