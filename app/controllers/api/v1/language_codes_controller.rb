class Api::V1::LanguageCodesController < Api::V1::ApiController
  def index
    skip_authorization
    language_codes = LanguageCode.all
    render json: LanguageCodeSerializer.new(language_codes).serialized_json
  end
end
