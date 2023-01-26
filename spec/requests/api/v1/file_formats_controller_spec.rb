require 'rails_helper'

RSpec.describe Api::V1::FileFormatsController, type: :request do
  describe 'GET /file_formats' do
    # public route
    it 'has status code 200 if not logged in' do
      get '/api/v1/file_formats'
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot(
        'file_formats_controller_file_formats_index',
        { snapshot_serializer: StripSerializer }
      )
    end
  end

  describe 'GET /file_format_extensions' do
    # public route
    it 'has status code 200 if not logged in' do
      get '/api/v1/file_format_extensions'
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to match_snapshot(
        'file_formats_controller_file_format_extensions_index',
        { snapshot_serializer: StripSerializer }
      )
    end
  end
end
