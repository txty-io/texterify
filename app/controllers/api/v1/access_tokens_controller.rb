class Api::V1::AccessTokensController < Api::V1::ApiController
  def index
    render json: AccessTokenSerializer.new(current_user.access_tokens).serialized_json
  end

  def create
    access_token = AccessToken.new(access_token_params)
    access_token.secret = SecureRandom.urlsafe_base64(nil, false)
    access_token.user = current_user

    if access_token.save
      render json: {
        ok: true,
        data: {
          secret: access_token.secret
        }
      }
    else
      render json: {
        errors: access_token.errors.full_messages.map { |error| "#{error}." }
      }, status: :bad_request
    end
  end

  def destroy
    access_token = current_user.access_tokens.find(params[:id])

    if access_token.destroy
      render json: {
        message: 'Access token deleted'
      }
    else
      render json: {
        message: 'Failed to delete access token'
      }
    end
  end

  private

  def access_token_params
    params.require(:access_token).permit(:name)
  end
end
