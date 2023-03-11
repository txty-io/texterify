require 'json'
require 'zip'

class Api::V1::ProjectsController < Api::V1::ApiController
  before_action :check_if_user_activated, except: [:show, :image, :index, :create, :recently_viewed]

  # Return the project image.
  def image
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    if project
      render json: { image: project.image.attached? ? url_for(project.image) : nil }
    else
      render json: { errors: project.errors.details }, status: :bad_request
    end
  end

  # Attach an image to a project.
  def image_create
    project = current_user.projects.find(params[:project_id])
    authorize project
    project.image.attach(params[:image])
  end

  # Remove an image from a project.
  def image_destroy
    project = current_user.projects.find(params[:project_id])
    authorize project
    project.image.purge
  end

  # Get a paginated list of all projects.
  def index
    skip_authorization

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    projects =
      if params[:search]
        current_user.projects.where('name ilike :search', search: "%#{params[:search]}%")
      else
        current_user.projects
      end

    options = {}
    options[:meta] = { total: projects.size }
    options[:include] = [:organization]
    options[:params] = { current_user: current_user }
    render json:
             ProjectSerializer.new(projects.order_by_name.offset(page * per_page).limit(per_page), options)
               .serialized_json,
           status: :ok
  end

  # Create a new project.
  def create
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    if organization.max_projects_reached?
      render json: { error: true, message: 'MAXIMUM_NUMBER_OF_PROJECTS_REACHED' }, status: :bad_request
      return
    end

    project = Project.new(project_params)
    project.organization = organization

    ActiveRecord::Base.transaction do
      unless project.save
        render json: { errors: project.errors.details }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      options = {}
      options[:params] = { current_user: current_user }
      render json: ProjectSerializer.new(project, options).serialized_json
    end
  end

  # Update a project.
  def update
    project = current_user.projects.find(params[:id])
    authorize project

    if project.update(project_params)
      options = {}
      options[:include] = [:organization]
      options[:params] = { current_user: current_user }
      render json: ProjectSerializer.new(project, options).serialized_json
    else
      render json: { errors: project.errors.details }, status: :bad_request
    end
  end

  def show
    skip_authorization
    project = current_user.projects.find(params[:id])

    recently_viewed_project = RecentlyViewedProject.find_by(project_id: project.id, user_id: current_user.id)
    if recently_viewed_project.present?
      recently_viewed_project.update(last_accessed: Time.now.utc)
    else
      RecentlyViewedProject.create(project_id: project.id, user_id: current_user.id, last_accessed: Time.now.utc)
    end

    options = {}
    options[:include] = [:organization]
    options[:params] = { current_user: current_user }
    render json: ProjectSerializer.new(project, options).serialized_json, status: :ok
  end

  def export
    project = current_user.projects.find(params[:project_id])
    authorize project

    export_config = project.export_configs.find(params[:id])

    if project.languages.empty?
      render json: { error: true, message: 'NO_LANGUAGES_FOUND_TO_EXPORT' }, status: :bad_request
      return
    end

    file = Tempfile.new(project.id)

    begin
      Txty::Export.create_export(project, export_config, file, emojify: params[:emojify])

      send_file(file, type: 'application/zip')
    ensure
      file.close
    end
  end

  def destroy
    project = current_user.projects.find(params[:id])
    authorize project

    # Don'f fire callbacks like the translation characters count callback.
    project.delete

    render json: { message: 'Project deleted' }
  end

  def activity
    skip_authorization

    limit = 5
    if params[:limit].present?
      limit = params[:limit].to_i || 5
      if limit < 1
        limit = 1
      end
      if limit > 20
        limit = 20
      end
    end

    project = current_user.projects.find(params[:project_id])
    unless project.feature_enabled?(Plan::FEATURE_PROJECT_ACTIVITY)
      return
    end

    versions = PaperTrail::Version.where(project_id: project.id).limit(limit).order(created_at: :desc)

    options = {}
    options[:include] = [:user, :key, :language, :'language.country_code']
    render json: ActivitySerializer.new(versions, options).serialized_json
  end

  def transfer
    project = current_user.projects.find(params[:project_id])
    authorize project
    organization = current_user.organizations.find(params[:organization_id])
    project.organization_id = organization.id
    project.save!

    render json: { success: true }, status: :ok
  end

  def recently_viewed
    skip_authorization

    projects =
      current_user
        .projects
        .joins('INNER JOIN recently_viewed_projects rvp ON rvp.project_id = projects.id')
        .where(rvp: { user_id: current_user.id })
        .order(last_accessed: :desc)

    per_page = 10

    options = {}
    options[:include] = [:organization]
    options[:params] = { current_user: current_user }
    render json: ProjectSerializer.new(projects.limit(per_page), options).serialized_json, status: :ok
  end

  def check_placeholders
    project = current_user.projects.find(params[:project_id])
    authorize project
    project.check_placeholders
    render json: { error: false, message: 'OK' }
  end

  private

  def project_params
    params.permit(
      :name,
      :description,
      :machine_translation_enabled,
      :auto_translate_new_keys,
      :auto_translate_new_languages,
      :placeholder_start,
      :placeholder_end,
      :validate_leading_whitespace,
      :validate_trailing_whitespace,
      :validate_double_whitespace,
      :validate_https
    )
  end
end
