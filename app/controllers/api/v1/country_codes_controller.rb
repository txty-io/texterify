class Api::V1::CountryCodesController < Api::V1::ApiController
  def index
    country_codes = CountryCode.all
    render json: CountryCodeSerializer.new(country_codes).serialized_json
  end
end
