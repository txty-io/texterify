require 'rails_helper'

RSpec.describe OrganizationSerializer, type: :serializer do
  it 'returns a short deepl api token correctly' do
    organization = create(:organization)
    organization.deepl_api_token = '1234'

    json = JSON.parse(OrganizationSerializer.new(organization).serialized_json)
    expect(json['data']['attributes']['deepl_api_token']).to eq('****')
  end

  it 'returns a long deepl api token correctly' do
    organization = create(:organization)
    organization.deepl_api_token = '12345678'

    json = JSON.parse(OrganizationSerializer.new(organization).serialized_json)
    expect(json['data']['attributes']['deepl_api_token']).to eq('12****78')
  end
end
