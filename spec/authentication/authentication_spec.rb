require 'rails_helper'

describe 'Whether authentication is working correctly', type: :request do
  context 'general authentication via API' do
    it 'gives you an authentication code if you successfully login' do
      user = FactoryBot.create(:user)
      sign_in(user)
      expect(response.has_header?('access-token')).to eq(true)
    end

    it 'gives you a status 200 on signing in' do
      user = FactoryBot.create(:user)
      sign_in(user)
      expect(response.status).to eq(200)
    end

    it 'gives you a status 401 on invalid signing in' do
      user = FactoryBot.create(:user)
      sign_in_invalid(user)
      expect(response.status).to eq(401)
    end
  end

  RSpec.shared_examples 'use authentication tokens of different ages' do |token_age, http_status|
    let(:vary_authentication_age) { token_age }

    it 'uses the given parameter' do
      expect(vary_authentication_age(token_age)).to have_http_status(http_status)
    end

    def vary_authentication_age(token_age)
      user = FactoryBot.create(:user)
      sign_in(user)
      auth_params = get_auth_params_from_login_response_headers(response)
      get api_v1_auth_validate_token_path, headers: auth_params
      expect(response).to have_http_status(:success)

      allow(Time).to receive(:now).and_return(Time.zone.now + token_age)

      get api_v1_auth_validate_token_path, headers: auth_params
      response
    end
  end

  context 'test access tokens of varying ages' do
    include_examples 'use authentication tokens of different ages', 2.days, :success
    include_examples 'use authentication tokens of different ages', 3.days, :success
    include_examples 'use authentication tokens of different ages', 4.days, :success
    include_examples 'use authentication tokens of different ages', 5.days, :success
    include_examples 'use authentication tokens of different ages', 13.days, :success
    include_examples 'use authentication tokens of different ages', 28.days - 1.hour, :success
    include_examples 'use authentication tokens of different ages', 28.days + 1.hour, :unauthorized
    include_examples 'use authentication tokens of different ages', 5.years, :unauthorized
  end
end
