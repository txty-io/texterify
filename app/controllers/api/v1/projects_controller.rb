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
    page = 0
    if params[:page].present?
      page = (params[:page].to_i || 1) - 1
      page = 0 if page < 0
    end

    per_page = 10
    if params[:per_page].present?
      per_page = params[:per_page].to_i || 10
      per_page = 10 if per_page < 1
    end

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
    project = Project.new(project_params)

    if params[:organization_id]
      project.organization = current_user.organizations.find(params[:organization_id])
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
      Zip::File.open(file.path, Zip::File::CREATE) do |zip|
        project.languages.order_by_name.each do |language|
          # Create the file content for a language.
          export_data = {}
          project.keys.order_by_name.each do |key|
            key_translation_export_config = key.translations.where(language_id: language.id, export_config_id: export_config.id).order(created_at: :desc).first
            key_translation = key_translation_export_config || key.translations.where(language_id: language.id, export_config_id: nil).order(created_at: :desc).first
            if key_translation.nil?
              export_data[key.name] = ''
            elsif key.html_enabled
              export_data[key.name] = helpers.convert_html_translation(key_translation.content)
            else
              export_data[key.name] = key_translation.content
            end
          end

          # Add translations of parent languages.
          parent_language = language.parent
          while parent_language.present?
            parent_language.keys.each do |key|
              if export_data[key.name].blank?
                key_translation_export_config = key.translations.where(language_id: parent_language.id, export_config_id: export_config.id).order(created_at: :desc).first
                key_translation = key_translation_export_config || key.translations.where(language_id: parent_language.id, export_config_id: nil).order(created_at: :desc).first
                if key_translation.nil?
                  export_data[key.name] = ''
                elsif key.html_enabled
                  export_data[key.name] = helpers.convert_html_translation(key_translation.content)
                else
                  export_data[key.name] = key_translation.content
                end
              end
            end
            parent_language = parent_language.parent
          end

          duplicate_zip_entry_count = 0
          loop do
            file_path = export_config.filled_file_path(language)

            if duplicate_zip_entry_count > 0
              file_path += duplicate_zip_entry_count.to_s
            end

            zip.add(file_path, export_config.file(language, export_data))
            break
          rescue Zip::EntryExistsError
            duplicate_zip_entry_count += 1
          end
        end
      end

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
        message: 'Missing required parameter'
      }, status: :bad_request
      return
    end

    file_content = Base64.decode64(file)
    begin
      json = JSON.parse(file_content)
    rescue JSON::ParserError
      render json: {
        ok: false,
        message: 'Invalid JSON.'
      }, status: :bad_request
      return
    end

    json.each do |json_key, json_value|
      key = project.keys.find_by(name: json_key)

      if key.present?
        translation = key.translations.find_by(language: language)

        if translation.present?
          translation.content = json_value
        else
          translation = Translation.new
          translation.content = json_value
          translation.key_id = key.id
          translation.language_id = language.id
          if export_config
            translation.export_config_id = export_config.id
          end
        end

        translation.save
      else
        key = Key.new(name: json_key)
        key.project_id = project.id

        if key.save!
          translation = Translation.new
          translation.content = json_value
          translation.key_id = key.id
          translation.language_id = language.id
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

    versions = PaperTrail::Version
      .where(project_id: project.id)
      .limit(limit)
      .order(created_at: :desc)

    options = {}
    options[:include] = [:user, :key, :language, :'language.country_code']
    render json: ActivitySerializer.new(versions, options).serialized_json
  end

  private

  def project_params
    params.permit(:name, :description)
  end
end
