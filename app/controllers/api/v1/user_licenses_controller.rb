class Api::V1::UserLicensesController < Api::V1::ApiController
  def index
    authorize UserLicense

    user_licenses = current_user.user_licenses.order(created_at: :desc)

    options = {}
    options[:meta] = { total: user_licenses.size }
    render json: UserLicenseSerializer.new(user_licenses, options).serialized_json
  end
end
