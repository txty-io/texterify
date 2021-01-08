class Api::V1::LicensesController < Api::V1::ApiController
  def index
    authorize License

    licenses = License.all.order(created_at: :desc)

    options = {}
    options[:meta] = { total: licenses.size }
    render json: LicenseSerializer.new(
      licenses,
      options
    ).serialized_json
  end

  def create
    authorize License

    license = License.new(license_params)

    begin
      Gitlab::License.import(license.data)
    rescue Gitlab::License::ImportError
      render json: {
        error: true,
        message: 'INVALID_LICENSE_FILE'
      }, status: :bad_request
      return
    end

    license.save!

    render json: LicenseSerializer.new(
      license
    ).serialized_json
  end

  def destroy
    authorize License

    license = License.find(params[:id])
    license.destroy

    render json: {
      message: 'License deleted'
    }
  end

  private

  def license_params
    license_params = params.permit(:data_file, :data)
    license_params.delete(:data) if license_params[:data_file]
    license_params
  end
end
