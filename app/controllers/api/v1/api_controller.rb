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
      # TODO: Remove the usage of the deprecated params.
      user = User.find_by(email: request.headers['Auth-Email'] || params[:email])
      api_secret = request.headers['Auth-Secret'].presence || params[:api_secret].presence
      token_correct = api_secret && user && user.access_tokens.find_by(secret: api_secret)
      if token_correct
        client_id = 'auth-from-access-token'

        user.tokens.delete(client_id)

        request.headers.merge! user.create_new_auth_token(client_id)
      end
    end

    def verify_signed_in
      if !user_signed_in?
        render json: {
                 errors: [{ details: 'You must be logged in to access this ressource.', code: 'INVALID_ACCESS_TOKEN' }]
               },
               status: :forbidden
      end
    end

    def render_not_found_error(model_name)
      error = { error: :not_found }

      render json: { errors: { "#{model_name.downcase}": [error] } }, status: :not_found
    end

    def parse_page(params_page)
      if params_page.present?
        page = (params_page.to_i || 1) - 1

        page < 1 ? 0 : page
      else
        0
      end
    end

    def parse_per_page(params_per_page)
      if params_per_page.present?
        per_page = params_per_page.to_i || 10

        if per_page < 1
          10
        elsif per_page > 50
          50
        else
          per_page
        end
      else
        10
      end
    end
  end
end
