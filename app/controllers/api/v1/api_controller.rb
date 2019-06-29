module Api::V1
  class ApiController < ApplicationController
    before_action :authenticate_user_from_token!
    before_action :verify_signed_in

    # Handle record not found errors.
    rescue_from ActiveRecord::RecordNotFound do |e|
      render_not_found_error e.model
    end

    private

    def authenticate_user_from_token!
      user = User.find_by(email: params[:email])
      api_secret = params[:api_secret].presence
      token_correct = api_secret && user && user.access_tokens.find_by(secret: api_secret)
      request.headers.merge! user.create_new_auth_token if token_correct
    end

    def verify_signed_in
      if !user_signed_in?
        render json: {
          errors: [
            {
              details: 'You must be logged in to access this ressource.',
              code: 'INVALID_ACCESS_TOKEN'
            }
          ]
        }, status: :forbidden
      end
    end

    def render_error(status, error_code, extra = {})
      I18n.with_locale(:en) do
        error = {
          message: I18n.t("error_messages.#{error_code}.message"),
          code: I18n.t("error_messages.#{error_code}.code")
        }.merge(extra)

        render json: { errors: [error] }, status: Rack::Utils.status_code(status)
      end
    end

    def render_not_found_error(model_name)
      message = I18n.t('error_messages.not_found.message', item: model_name)

      message = I18n.t('error_messages.not_found.message_generic') if model_name.nil?

      error = {
        message: message,
        code: I18n.t('error_messages.not_found.code')
      }

      render json: { errors: [error] }, status: :not_found
    end
  end
end
