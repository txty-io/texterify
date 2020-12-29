# frozen_string_literal: true

class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json

  before_action :configure_permitted_parameters, if: :devise_controller?
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def app
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:username, :email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:account_update, keys: [:username, :email, :password, :password_confirmation])
  end

  # Handle unsupported formats.
  rescue_from(ActionController::UnknownFormat) do
    head(:not_acceptable)
  end

  # Handle expired/used password reset and account confirmation links.
  rescue_from(ActionController::RoutingError) do
    if controller_name == 'passwords' && action_name == 'edit'
      redirect_to '/invalid-password-reset-link'
    elsif controller_name == 'confirmations' && action_name == 'show'
      redirect_to '/invalid-account-confirmation-link'
    else
      raise
    end
  end

  private

  def user_not_authorized
    head(:forbidden)
  end

  def feature_enabled?(object, feature)
    if object.feature_enabled?(feature)
      true
    else
      feature_allowed_plans = Organization::FEATURES_PLANS[feature]

      render json: {
        errors: [
          {
            code: 'FEATURE_NOT_AVAILABLE_IN_PLAN',
            description: "Please upgrade your plan to one of the following: #{feature_allowed_plans.join(', ')}"
          }
        ]
      }, status: :forbidden

      false
    end
  end
end
