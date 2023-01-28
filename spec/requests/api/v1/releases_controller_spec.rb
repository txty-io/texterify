require 'rails_helper'

RSpec.describe Api::V1::ReleasesController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
    @project = create(:project, :with_organization, :with_business_plan)
    @export_config =
      create(:export_config, project_id: @project.id, file_format_id: FileFormat.find_by!(format: 'json').id)
    @export_config.save!

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'owner'
    project_user.save!
  end

  describe 'GET index' do
    it 'has status code 403 if not logged in', :skip_before do
      get "/api/v1/projects/#{@project.id}/releases"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 200 and returns empty array' do
      get "/api/v1/projects/#{@project.id}/releases", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['meta']['total']).to eq(0)
    end

    it 'has status code 200 and returns releases paginated' do
      create(:release, export_config_id: @export_config.id)
      create(:release, export_config_id: @export_config.id)
      create(:release, export_config_id: @export_config.id)
      get "/api/v1/projects/#{@project.id}/releases", headers: @auth_params, params: { per_page: 2 }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(2)
      expect(body['data'][0].keys).to contain_exactly('attributes', 'id', 'relationships', 'type')
      expect(body['data'][0]['attributes'].keys).to contain_exactly('id', 'timestamp', 'version')
      expect(body['meta']['total']).to eq(3)

      get "/api/v1/projects/#{@project.id}/releases", headers: @auth_params, params: { per_page: 2, page: 2 }
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(1)
      expect(body['data'][0].keys).to contain_exactly('attributes', 'id', 'relationships', 'type')
      expect(body['data'][0]['attributes'].keys).to contain_exactly('id', 'timestamp', 'version')
      expect(body['meta']['total']).to eq(3)

      get "/api/v1/projects/#{@project.id}/releases", headers: @auth_params, params: { per_page: 2, page: 3 }
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(0)
      expect(body['meta']['total']).to eq(3)
    end
  end

  describe 'GET release' do
    it 'has status code 400 if no releases are available' do
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release"
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'NO_RELEASES_FOUND' }])
    end

    it 'has status code 400 if releases are available but no locale was given' do
      create(:release, export_config_id: @export_config.id)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release"
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'NO_LOCALE_GIVEN' }])
    end

    it 'has status code 304 if no release file for locale was found' do
      create(:release, export_config_id: @export_config.id)
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT"
      expect(response).to have_http_status(:not_modified)
    end

    it 'has status code 302 if release file for locale was found' do
      create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT"
      expect(response).to have_http_status(:found)
    end

    it 'has status code 302 if release file for locale was found #1' do
      release = create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de"
      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(release.release_files[0].url)
    end

    it 'has status code 302 if release file for locale was found #2' do
      release =
        create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de"
      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(release.release_files[0].url)
    end

    it 'has status code 302 if release file for locale was found #3' do
      release =
        create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-DE"
      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(release.release_files[0].url)
    end

    it 'has status code 302 if release file for locale was found #4' do
      create(
        :release,
        export_config_id: @export_config.id,
        locales: [{ language_code: 'de', country_code: 'AT' }, { language_code: 'de', country_code: 'DE' }]
      )
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-DE"
      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(%r{http://localhost/url-de-DE-.})
    end

    it 'has status code 304 if timestamp is in the future' do
      create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      time = Time.now.utc
      timestamp = time.iso8601
      timestamp_10_minutes_in_future = (time + (10 * 60)).iso8601
      create(
        :release,
        export_config_id: @export_config.id,
        timestamp: timestamp,
        locales: [{ language_code: 'de', country_code: 'AT' }]
      )
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{timestamp_10_minutes_in_future}"
      expect(response).to have_http_status(:not_modified)
    end

    it 'has status code 304 if timestamp is equal to latest release timestamp' do
      create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      release =
        create(
          :release,
          export_config_id: @export_config.id,
          locales: [{ language_code: 'de', country_code: 'AT' }],
          timestamp: (Time.now.utc + (10 * 60)).iso8601
        )
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{release.timestamp}"
      expect(response).to have_http_status(:not_modified)
    end

    it 'has status code 302 if timestamp is equal to old release timestamp' do
      old_release =
        create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      create(
        :release,
        export_config_id: @export_config.id,
        locales: [{ language_code: 'de', country_code: 'AT' }],
        timestamp: (Time.now.utc + (10 * 60)).iso8601
      )
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{old_release.timestamp}"
      expect(response).to have_http_status(:found)
    end

    it 'has status code 304 if timestamp is equal to old release timestamp but locale is not available anymore in new release' do
      old_release =
        create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      create(
        :release,
        export_config_id: @export_config.id,
        locales: [{ language_code: 'en' }],
        timestamp: (Time.now.utc + (10 * 60)).iso8601
      )
      get "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/release?locale=de-AT&timestamp=#{old_release.timestamp}"
      expect(response).to have_http_status(:not_modified)
    end
  end

  describe 'POST create' do
    it 'has status code 403 if not logged in', :skip_before do
      post "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/releases"
      expect(response).to have_http_status(:forbidden)
    end

    it 'has status code 400 and returns error when no language with language code is available' do
      post "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/releases", headers: @auth_params
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'NO_LANGUAGES_WITH_LANGUAGE_CODE' }])
    end

    it 'has status code 200 and creates a first release' do
      expect(Release.all.size).to eq(0)
      language = Language.new
      language.project = @project
      language.name = 'German'
      language.language_code = LanguageCode.first
      language.save!
      post "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/releases", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be(true)
      expect(Release.all.size).to eq(1)
    end

    it 'has status code 200 and creates a second release with increased version' do
      create(:release, export_config_id: @export_config.id, locales: [{ language_code: 'de', country_code: 'AT' }])
      expect(Release.all.size).to eq(1)
      version = Release.first.version
      language = Language.new
      language.project = @project
      language.name = 'German'
      language.language_code = LanguageCode.first
      language.save!
      post "/api/v1/projects/#{@project.id}/export_configs/#{@export_config.id}/releases", headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be(true)
      expect(Release.all.size).to eq(2)
      expect(Release.order(created_at: :desc).first.version).to eq(version + 1)
    end
  end
end
