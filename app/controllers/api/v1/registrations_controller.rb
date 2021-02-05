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
    if (ENV['DEV_ENABLE_LICENSE_USERS_LIMIT_CHECK'] == 'true' && Rails.env.development?) && !IS_TEXTERIFY_CLOUD
      license = License.current_active
      if !license || license.restrictions[:active_users_count].nil? || User.all.size >= license.restrictions[:active_users_count]
        render json: {
          error: true,
          message: 'MAXIMUM_NUMBER_OF_USERS_REACHED'
        }, status: :bad_request
      end
    end
  end
end
