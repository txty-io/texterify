require 'google/cloud/storage'

if ENV['GOOGLE_CLOUD_PROJECT'] && ENV['GOOGLE_CLOUD_KEYFILE']
  Google::Cloud::Storage.configure do |config|
    config.project_id = ENV['GOOGLE_CLOUD_PROJECT']
    config.credentials = JSON.parse(ENV['GOOGLE_CLOUD_KEYFILE'])
  end
end

class Api::V1::ReleasesController < Api::V1::ApiController
  skip_before_action :verify_signed_in, only: :release

  def release
    # This endpoint can be called by everyone.
    skip_authorization

    project = Project.find(params[:project_id])
    export_config = project.export_configs.find(params[:export_config_id])
    latest_release = export_config.latest_release

    if !latest_release
      render json: {
        errors: [
          {
            code: 'NO_RELEASES_FOUND'
          }
        ]
      }, status: :bad_request
      return
    end

    version = params[:version].to_i

    if !version
      redirect_to latest_release.url
      return
    elsif version == latest_release.to_version
      head :not_modified
      return
    elsif version > latest_release.to_version || version < 1
      render json: {
        errors: [
          {
            code: 'NOT_A_VALID_VERSION'
          }
        ]
      }, status: :bad_request
      return
    end

    existing_release = export_config.releases.find_by(from_version: version, to_version: latest_release.to_version)

    if existing_release
      redirect_to existing_release.url
    else
      new_release = helpers.create_release(project, export_config, version, latest_release.to_version)
      redirect_to new_release.url
    end
  end

  def create
    project = Project.find(params[:project_id])
    export_config = project.export_configs.find(params[:export_config_id])

    release = Release.new
    release.export_config = export_config
    authorize release

    if !project.releases.where(export_config: export_config).empty?
      latest_release = export_config.latest_release
    end

    file = Tempfile.new(project.id)

    begin
      helpers.create_export(project, export_config, file)
    ensure
      file.close
    end

    if latest_release
      version = latest_release.to_version + 1
    else
      version = 1
    end

    helpers.create_release(project, export_config, version, version)
    render json: {
      success: true
    }
  end
end
