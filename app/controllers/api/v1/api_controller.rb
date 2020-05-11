module Api::V1
  class ApiController < ApplicationController
    include Pundit

    before_action :authenticate_user_from_token!
    before_action :verify_signed_in
    before_action :set_paper_trail_whodunnit

    after_action :verify_authorized

    # Handle record not found errors.
    rescue_from ActiveRecord::RecordNotFound do |e|
      render_not_found_error e.model
    end

    private

    def authenticate_user_from_token!
      user = User.find_by(email: params[:email])
      api_secret = params[:api_secret].presence
      token_correct = api_secret && user && user.access_tokens.find_by(secret: api_secret)
      if token_correct
        request.headers.merge! user.create_new_auth_token
      end
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

    def render_not_found_error(model_name)
      error = {
        error: :not_found
      }

      render json: { errors: { "#{model_name.downcase}": [error] } }, status: :not_found
    end
  end
end
