class Api::V1::OrganizationMachineTranslationController < Api::V1::ApiController
  def update
    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    # Determine if the given API token is a token for the free or pro API.
    deepl_api_token = params[:deepl_api_token]
    if deepl_api_token
      deepl_client = Deepl::V2::Client.new
      deepl_client.set_api_credentials(deepl_api_token, DEEPL_FREE_API)
      response = deepl_client.usage
      if response.nil?
        deepl_client.set_api_credentials(deepl_api_token, DEEPL_PRO_API)
        response = deepl_client.usage

        if response.nil?
          render json: { error: true, details: 'INVALID_DEEPL_API_TOKEN' }
          return
        else
          organization.deepl_api_token_type = 'pro'
        end
      else
        organization.deepl_api_token_type = 'free'
      end
    else
      organization.deepl_api_token_type = nil
    end

    organization.deepl_api_token = deepl_api_token

    if organization.save!
      options = {}
      options[:params] = { current_user: current_user }
      render json: OrganizationSerializer.new(organization, options).serialized_json
    else
      render json: { errors: organization.errors.details }, status: :bad_request
    end
  end
end
