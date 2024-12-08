require 'rails_helper'

RSpec.describe Api::V1::OrganizationMachineTranslationController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = create(:user)
      @auth_params = sign_in(@user)

      @user_not_in_organization = create(:user)
      @auth_params_not_in_organization = sign_in(@user_not_in_organization)

      @organization = Organization.new
      @organization.id = '16a09453-096b-4996-8271-2c156691b919'
      @organization.name = 'Test Organization'
      @organization.save!

      @organization_user = OrganizationUser.new
      @organization_user.organization_id = @organization.id
      @organization_user.user_id = @user.id
      @organization_user.role = 'owner'
      @organization_user.save!
    end
  end

  def test_fails_to_update_organization_machine_translation_settings_correctly_without_permissions(role)
    @organization_user.role = role
    @organization_user.save!

    put "/api/v1/organizations/#{@organization.id}/machine_translation",
        params: {
          deepl_api_token: '<invalid token>'
        },
        headers: @auth_params
    expect(response).to have_http_status(:forbidden)
  end

  def test_allows_to_update_settings_with_permissions(role)
    @organization_user.role = role
    @organization_user.save!

    put "/api/v1/organizations/#{@organization.id}/machine_translation",
        params: {
          deepl_api_token: '<invalid token>'
        },
        headers: @auth_params
    expect(response).to have_http_status(:ok)
  end

  describe 'PUT update' do
    it 'responds with json by default' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'fails to update settings without auth' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation",
          params: {
            deepl_api_token: '<invalid token>'
          }
      expect(response).to have_http_status(:forbidden)
    end

    it 'fails to update settings without being part of organization' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation",
          params: {
            deepl_api_token: '<invalid token>'
          },
          headers: @auth_params_not_in_organization
      expect(response).to have_http_status(:not_found)
    end

    it 'fails to update settings as translator' do
      test_fails_to_update_organization_machine_translation_settings_correctly_without_permissions(ROLE_TRANSLATOR)
    end

    it 'fails to update settings as developer' do
      test_fails_to_update_organization_machine_translation_settings_correctly_without_permissions(ROLE_DEVELOPER)
    end

    it 'allows to update settings as manager' do
      test_allows_to_update_settings_with_permissions(ROLE_MANAGER)
    end

    it 'allows to update settings as owner' do
      test_allows_to_update_settings_with_permissions(ROLE_OWNER)
    end

    it 'updates settings with valid free token' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation",
          params: {
            deepl_api_token: '<valid_free_token>:fx'
          },
          headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['id']).to eq(@organization.id)
      expect(body['data']['attributes']['deepl_api_token']).to eq('<v*****************fx')
      expect(body['data']['attributes']['deepl_api_token_type']).to eq('free')
    end

    it 'updates settings with valid pro token' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation",
          params: {
            deepl_api_token: '<valid_pro_token>'
          },
          headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']['id']).to eq(@organization.id)
      expect(body['data']['attributes']['deepl_api_token']).to eq('<v*************n>')
      expect(body['data']['attributes']['deepl_api_token_type']).to eq('pro')
    end

    it 'does not update settings with invalid token' do
      put "/api/v1/organizations/#{@organization.id}/machine_translation",
          params: {
            deepl_api_token: '<invalid_token>'
          },
          headers: @auth_params
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['error']).to be(true)
      expect(body['details']).to eq('INVALID_DEEPL_API_TOKEN')

      organization = Organization.find(@organization.id)
      expect(organization.deepl_api_token).to be_nil
      expect(organization.deepl_api_token_type).to be_nil
    end

    it 'clears settings when no token is provided' do
      @organization.deepl_api_token = 'token'
      @organization.deepl_api_token_type = 'pro'
      @organization.save!

      expect(@organization.deepl_api_token).to eq('token')
      expect(@organization.deepl_api_token_type).to eq('pro')

      put "/api/v1/organizations/#{@organization.id}/machine_translation", headers: @auth_params
      expect(response).to have_http_status(:ok)

      organization = Organization.find(@organization.id)
      expect(organization.deepl_api_token).to be_nil
      expect(organization.deepl_api_token_type).to be_nil
    end
  end
end
