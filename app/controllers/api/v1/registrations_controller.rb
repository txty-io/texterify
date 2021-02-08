class Api::V1::RegistrationsController < DeviseTokenAuth::RegistrationsController
  before_action :check_users_limit_on_premise, only: [:create]

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

  def check_users_limit_on_premise
    if (ENV['DEV_ENABLE_LICENSE_USERS_LIMIT_CHECK'] == 'true' && (Rails.env.development? || Rails.env.test?)) && Texterify.on_premise?
      license = License.current_active

      with_license_users_exceeded = license && (license.restrictions[:active_users_count].present? && User.all.size >= license.restrictions[:active_users_count])
      without_license_users_exceeded = !license && User.all.size >= 1

      if with_license_users_exceeded || without_license_users_exceeded
        render json: {
          error: true,
          message: 'MAXIMUM_NUMBER_OF_USERS_REACHED'
        }, status: :bad_request
      end
    end
  end
end
