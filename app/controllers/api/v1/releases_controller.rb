require 'google/cloud/storage'

if ENV['GOOGLE_CLOUD_PROJECT'].present? && ENV['GOOGLE_CLOUD_KEYFILE'].present?
  Google::Cloud::Storage.configure do |config|
    config.project_id = ENV['GOOGLE_CLOUD_PROJECT']
    config.credentials = JSON.parse(ENV['GOOGLE_CLOUD_KEYFILE'])
  end
end

class Api::V1::ReleasesController < Api::V1::ApiController
  skip_before_action :verify_signed_in, only: :release
  before_action :check_if_user_activated, except: [:release]

  def index
    project = current_user.projects.find(params[:project_id])

    export_config = ExportConfig.new
    export_config.project = project
    release = Release.new
    release.export_config = export_config
    authorize release

    releases = project.releases

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    options = {}
    options[:meta] = { total: releases.size }
    options[:include] = [:export_config, :release_files]
    render json:
             ReleaseSerializer.new(releases.order('timestamp DESC').offset(page * per_page).limit(per_page), options)
               .serialized_json
  end

  def release
    # This endpoint can be called by everyone.
    skip_authorization

    project = Project.find(params[:project_id])
    unless feature_enabled?(project, Organization::FEATURE_OTA)
      return
    end

    export_config = project.export_configs.find(params[:export_config_id])

    latest_release = export_config.latest_release

    if !latest_release
      render json: { errors: [{ code: 'NO_RELEASES_FOUND' }] }, status: :bad_request
      return
    end

    locale = params[:locale]
    if !locale
      render json: { errors: [{ code: 'NO_LOCALE_GIVEN' }] }, status: :bad_request
      return
    end

    timestamp = nil

    if params[:timestamp].present?
      begin
        timestamp = DateTime.parse(params[:timestamp])
      rescue Date::Error
        # Do not handle
      end
    end

    release_timestamp = export_config.releases.find_by(timestamp: timestamp)

    response.set_header('Cache-Control', 'public, max-age=120')

    if !release_timestamp && timestamp && timestamp > latest_release.timestamp
      # Skip in case the texts of the app are newer than the texts of the latest release.
      head :not_modified
    elsif !release_timestamp
      release_file = latest_release.latest_release_file_for_locale(locale)
      if release_file
        redirect_to release_file.url
      else
        head :not_modified
      end
    elsif release_timestamp.version == latest_release.version
      head :not_modified
    else
      release_file = latest_release.latest_release_file_for_locale(locale)
      if release_file
        redirect_to release_file.url
      else
        head :not_modified
      end
    end
  end

  def create
    project = current_user.projects.find(params[:project_id])

    export_config = project.export_configs.find(params[:export_config_id])

    release = Release.new
    release.export_config = export_config
    authorize release
    unless feature_enabled?(project, Organization::FEATURE_OTA)
      return
    end

    if project.languages.where.not(language_code: nil).empty?
      render json: { errors: [{ code: 'NO_LANGUAGES_WITH_LANGUAGE_CODE' }] }, status: :bad_request
      return
    end

    if !project.releases.where(export_config: export_config).empty?
      latest_release = export_config.latest_release
    end

    if latest_release
      version = latest_release.version + 1
    else
      version = 1
    end

    helpers.create_release(project, export_config, version)

    render json: { success: true }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    releases_to_destroy = project.releases.find(params[:releases])
    releases_to_destroy.each { |release| authorize release }
    project.releases.where(id: releases_to_destroy.map(&:id)).destroy_all

    render json: { success: true, details: 'Releases deleted' }
  end
end
