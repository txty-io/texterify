class Api::V1::RegistrationsController < DeviseTokenAuth::RegistrationsController
  before_action :check_if_user_can_sign_up, only: [:create]

  def create
    super do |user|
      # The first user that registers is the superadmin user of the instance.
      unless User.exists?(is_superadmin: true)
        user.is_superadmin = true
        user.save!
      end
    end
  end

  private

  def check_if_user_can_sign_up
    email = params['email']
    has_project_invite = ProjectInvite.exists?(email: email, open: true)
    has_organization_invite = OrganizationInvite.exists?(email: email, open: true)

    if !has_project_invite && !has_organization_invite
      # Check if the sign up is enabled.
      unless Setting.sign_up_enabled
        render json: { error: true, message: 'SIGN_UP_NOT_ENABLED' }, status: :bad_request
        return
      end

      # Check if a domain filter has been set and if the domain of the registration email matches the filter.
      if Setting.domain_filter
        email_domain = email.split('@')[-1]

        if email_domain != Setting.domain_filter
          render json: { error: true, message: 'EMAIL_DOMAIN_IS_NOT_ALLOWED_TO_SIGN_UP' }, status: :bad_request
          return
        end
      end
    end

    # Check for the user limit of the on-premise solution.
    check_users_limit_on_premise
  end

  # Checks if the user limit has been reached for the current license in on-premise mode.
  # This check can also be manually activated via DEV_ENABLE_LICENSE_USERS_LIMIT_CHECK for the dev and test env.
  def check_users_limit_on_premise
    # TODO: Enable if user management has been added for the admin.
    # manually_enabled =
    #   ENV['DEV_ENABLE_LICENSE_USERS_LIMIT_CHECK'] == 'true' && (Rails.env.development? || Rails.env.test?)
    # on_premise_in_production = Texterify.on_premise? && Rails.env.production?
    # if manually_enabled || on_premise_in_production
    #   license = License.current_active
    #   with_license_users_exceeded =
    #     license &&
    #       (
    #         license.restrictions[:active_users_count].present? &&
    #           User.all.size >= license.restrictions[:active_users_count]
    #       )
    #   without_license_users_exceeded = !license && User.all.size >= 1
    #   if with_license_users_exceeded || without_license_users_exceeded
    #     render json: { error: true, message: 'MAXIMUM_NUMBER_OF_USERS_REACHED' }, status: :bad_request
    #   end
    # end
  end
end
