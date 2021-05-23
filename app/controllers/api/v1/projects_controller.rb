require 'json'
require 'zip'

class Api::V1::ProjectsController < Api::V1::ApiController
  def image
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    if project
      render json: {
        image: project.image.attached? ? url_for(project.image) : nil
      }
    else
      render json: {
        errors: project.errors.details
      }, status: :bad_request
    end
  end

  def image_create
    project = current_user.projects.find(params[:project_id])
    authorize project
    project.image.attach(params[:image])
  end

  def image_destroy
    project = current_user.projects.find(params[:project_id])
    authorize project
    project.image.purge
  end

  def index
    skip_authorization

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    projects = if params[:search]
                 current_user.projects.where(
                   'name ilike :search',
                   search: "%#{params[:search]}%"
                 )
               else
                 current_user.projects
               end

    options = {}
    options[:meta] = { total: projects.size }
    options[:include] = [:organization]
    options[:params] = { current_user: current_user }
    render json: ProjectSerializer.new(projects.order_by_name.offset(page * per_page).limit(per_page), options).serialized_json, status: :ok
  end

  def create
    skip_authorization

    if params[:organization_id]
      organization = current_user.organizations.find(params[:organization_id])
    end

    if organization && !organization.feature_enabled?(Organization::FEATURE_UNLIMITED_PROJECTS) && organization.projects.size >= 1
      render json: {
        error: true,
        message: 'MAXIMUM_NUMBER_OF_PROJECTS_REACHED'
      }, status: :bad_request
      return
    elsif !organization && current_user.private_projects.size >= 1
      render json: {
        error: true,
        message: 'MAXIMUM_NUMBER_OF_PROJECTS_REACHED'
      }, status: :bad_request
      return
    end

    project = Project.new(project_params)

    if params[:organization_id]
      project.organization = organization
    else
      project_column = ProjectColumn.new
      project_column.project = project
      project_column.user = current_user
    end

    ActiveRecord::Base.transaction do
      unless project.save
        render json: {
          errors: project.errors.details
        }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      unless params[:organization_id]
        unless project_column.save
          render json: {
            errors: project_column.errors.details
          }, status: :bad_request
          raise ActiveRecord::Rollback
        end

        project_user = ProjectUser.new
        project_user.user_id = current_user.id
        project_user.project_id = project.id
        project_user.role = 'owner'
        unless project_user.save
          render json: {
            errors: project_user.errors.details
          }, status: :bad_request
          raise ActiveRecord::Rollback
        end
      end

      options = {}
      options[:params] = { current_user: current_user }
      render json: ProjectSerializer.new(project, options).serialized_json
    end
  end

  def update
    project = current_user.projects.find(params[:id])
    authorize project

    if project.update(project_params)
      options = {}
      options[:include] = [:organization]
      options[:params] = { current_user: current_user }
      render json: ProjectSerializer.new(project, options).serialized_json
    else
      render json: {
        errors: project.errors.details
      }, status: :bad_request
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
      render json: {
        error: true,
        messages: ["can't export anything without languages"]
      }, status: :bad_request
      return
    end

    file = Tempfile.new(project.id)

    begin
      helpers.create_export(project, export_config, file, { emojify: params[:emojify] })

      send_file(
        file,
        type: 'application/zip'
      )
    ensure
      file.close
    end
  end

  def import
    project = current_user.projects.find(params[:project_id])
    authorize project
    language = project.languages.find(params[:language_id])
    if params[:export_config_id].present?
      export_config = project.export_configs.find(params[:export_config_id])
    end
    file = params[:file]

    unless file
      render json: {
        error: true,
        message: 'NO_OR_EMPTY_FILE'
      }, status: :bad_request
      return
    end

    file_name = params[:name]
    file_content = Base64.decode64(file).force_encoding('UTF-8')

    file_format = params[:file_format]

    begin
      parsed_data = helpers.parse_file_content(file_name, file_content, file_format)
    rescue RuntimeError => e
      render json: {
        error: true,
        message: e.message
      }, status: :bad_request
      return
    end

    parsed_data.each do |json_key, json_value|
      key = project.keys.find_by(name: json_key)

      if key.present?
        translation = key.translations.find_by(language: language)

        if translation.blank?
          translation = Translation.new
          translation.content = json_value
          translation.key_id = key.id
          translation.language_id = language.id

          if export_config
            translation.export_config_id = export_config.id
          end
        end

        if file_format == 'json-formatjs'
          translation.content = json_value['defaultMessage']

          key.description = json_value['description']
          key.save
        elsif file_format == 'go-i18n' && json_value.is_a?(Hash)
          translation.content = json_value[:value]

          key.description = json_value[:description]
          key.save
        else
          translation.content = json_value
        end

        translation.save
      else
        key = Key.new(name: json_key)
        key.project_id = project.id

        if file_format == 'json-formatjs'
          key.description = json_value['description']
        elsif file_format == 'go-i18n' && json_value.is_a?(Hash)
          key.description = json_value[:description]
        end

        if key.save!
          translation = Translation.new
          translation.key_id = key.id
          translation.language_id = language.id

          if export_config
            translation.export_config_id = export_config.id
          end

          if file_format == 'json-formatjs'
            translation.content = json_value['defaultMessage']
          elsif file_format == 'go-i18n' && json_value.is_a?(Hash)
            translation.content = json_value[:value]
          else
            translation.content = json_value
          end

          translation.save
        end
      end
    end

    render json: {
      message: 'Successfully imported translations.',
      ok: true
    }, status: :ok
  end

  def destroy
    project = current_user.projects.find(params[:id])
    authorize project
    project.destroy

    render json: {
      message: 'Project deleted'
    }
  end

  def activity
    skip_authorization

    limit = 5
    if params[:limit].present?
      limit = params[:limit].to_i || 5
      limit = 1 if limit < 1
      limit = 20 if limit > 20
    end

    project = current_user.projects.find(params[:project_id])
    return unless feature_enabled?(project, Organization::FEATURE_PROJECT_ACTIVITY)

    versions = PaperTrail::Version
      .where(project_id: project.id)
      .limit(limit)
      .order(created_at: :desc)

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

    render json: {
      success: true
    }, status: :ok
  end

  def recently_viewed
    skip_authorization

    projects = current_user.projects
      .joins('INNER JOIN recently_viewed_projects rvp ON rvp.project_id = projects.id')
      .where('rvp.user_id = ?', current_user.id)
      .order(last_accessed: :desc)

    per_page = 10

    options = {}
    options[:include] = [:organization]
    options[:params] = { current_user: current_user }
    render json: ProjectSerializer.new(projects.limit(per_page), options).serialized_json, status: :ok
  end

  private

  def project_params
    params.permit(:name, :description, :validate_leading_whitespace, :validate_trailing_whitespace, :validate_double_whitespace, :validate_https)
  end
end
