require 'rails_helper'

RSpec.describe 'ValidationViolations', type: :request do
  describe 'GET /index' do
    it 'returns http success' do
      get '/validation_violations/index'
      expect(response).to have_http_status(:success)
    end
  end
end
