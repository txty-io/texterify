require 'rails_helper'

RSpec.describe Api::V1::KeysController, type: :request do
  before(:each) do
    @user = create(:user)
    @auth_params = sign_in(@user)
    @project = create(:project, :with_organization, :with_business_plan)

    project_user = ProjectUser.new
    project_user.project = @project
    project_user.user = @user
    project_user.role = 'developer'
    project_user.save!

    @language = create(:language, project_id: @project.id)
    @key = create(:key, project_id: @project.id)
    @translation = create(:translation, key_id: @key.id, language_id: @language.id, content: 'Hello world')
  end

  describe 'GET index' do
    describe 'search' do
      it 'returns matching keys by name' do
        get "/api/v1/projects/#{@project.id}/keys", params: { search: @key.name }, headers: @auth_params, as: :json
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['meta']['total']).to be >= 1
      end

      it 'returns no results for a non-matching search term' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              search: 'zzz_no_match_zzz'
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['meta']['total']).to eq(0)
      end

      it 'rejects an invalid eq_op via the scope whitelist' do
        # Inject a malicious operator — the scope should raise and the request should not succeed cleanly
        expect do
          Key.match_name_or_description_or_translation_content('foo', "'; DROP TABLE keys; --", false)
        end.to raise_error(ArgumentError, /Invalid operator/)
      end
    end

    it 'returns forbidden for a disabled project' do
      @project.update!(disabled: true)

      get "/api/v1/projects/#{@project.id}/keys", headers: @auth_params, as: :json

      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['error_type']).to eq('PROJECT_IS_DISABLED')
    end

    describe 'changed_before / changed_after filtering' do
      it 'returns keys changed before a valid date' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              changed_before: (Time.zone.today + 1).iso8601
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:ok)
      end

      it 'returns keys changed after a valid date' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              changed_after: (Time.zone.today - 1).iso8601
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:ok)
      end

      it 'returns 400 for an invalid changed_before date' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              changed_before: 'not-a-date'
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:bad_request)
        body = JSON.parse(response.body)
        expect(body['error']).to be(true)
        expect(body['message']).to eq('Invalid changed_before date')
      end

      it 'returns 400 for an invalid changed_after date' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              changed_after: 'not-a-date'
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:bad_request)
        body = JSON.parse(response.body)
        expect(body['error']).to be(true)
        expect(body['message']).to eq('Invalid changed_after date')
      end

      it 'returns 400 for a malformed changed_before date (SQL injection attempt)' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              changed_before: "2024-01-01'; DROP TABLE keys; --"
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns 400 for a malformed changed_after date (SQL injection attempt)' do
        get "/api/v1/projects/#{@project.id}/keys",
            params: {
              changed_after: "2024-01-01'; DROP TABLE keys; --"
            },
            headers: @auth_params,
            as: :json
        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
