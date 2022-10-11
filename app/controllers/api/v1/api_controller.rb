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
      render json: {
               error: true,
               message: 'NOT_FOUND',
               details: {
                 "#{model_name.underscore}": :not_found
               }
             },
             status: :not_found
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

    # Returns an error if the user is not activated.
    def check_if_user_activated
      if self.user_deactivated?
        render json: { error: true, message: 'USER_IS_DEACTIVATED' }, status: :bad_request
      end
    end

    # Checks if a user is deactivated for an organization or project.
    # Depends on the params ":project_id" and ":organization_id".
    def user_deactivated?
      project_id = nil
      if params[:project_id].present?
        project_id = params[:project_id]
      elsif controller_name == 'projects' && params[:id].present?
        project_id = params[:id]
      end

      organization_id = nil
      if params[:organization_id].present?
        organization_id = params[:organization_id]
      elsif controller_name == 'organizations' && params[:id].present?
        organization_id = params[:id]
      end

      if project_id
        project = current_user.projects.find(project_id)
        project_user = project.project_users.find_by(user_id: current_user.id)
        organization_user = project.organization&.organization_users&.find_by(user_id: current_user.id)
      elsif organization_id
        organization = current_user.organizations.find(organization_id)
        organization_user = organization.organization_users.find_by(user_id: current_user.id)
      end

      (!project_user || project_user.deactivated) && (!organization_user || organization_user.deactivated)
    end
  end
end
