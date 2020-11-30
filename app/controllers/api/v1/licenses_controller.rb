class Api::V1::LicensesController < Api::V1::ApiController
  def index
    authorize License.new

    licenses = License.all

    options = {}
    options[:meta] = { total: licenses.size }
    render json: LicenseSerializer.new(
      licenses,
      options
    ).serialized_json
  end

  def create
    authorize License.new

    license = License.new(license_params)
    license.save

    render json: LicenseSerializer.new(
      license
    ).serialized_json
  end

  def destroy
    authorize License.new

    license = License.find(params[:id])
    license.destroy

    render json: {
      message: 'License deleted'
    }
  end

  private

  def license_params
    license_params = params.require(:license).permit(:data_file, :data)
    license_params.delete(:data) if license_params[:data_file]
    license_params
  end
end
