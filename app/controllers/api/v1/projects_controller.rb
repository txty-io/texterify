require 'json'
require 'zip'

class Api::V1::ProjectsController < Api::V1::ApiController
  include ExportHelper

  def index
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
                 ).order(:name)
               else
                 current_user.projects.order(:name)
               end

    options = {}
    options[:meta] = { total: projects.count }
    options[:params] = { current_user: current_user }
    render json: ProjectSerializer.new(projects.offset(page * per_page).limit(per_page), options).serialized_json, status: :ok
  end

  def create
    project = Project.new(project_params)
    project.user = current_user

    project_column = ProjectColumn.new
    project_column.project = project
    project_column.user = current_user

    ActiveRecord::Base.transaction do
      unless project.save
        render json: {
          errors: project.errors.full_messages.map { |error| "#{error}." }
        }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      unless project_column.save
        render json: {
          errors: project_column.errors.full_messages.map { |error| "#{error}." }
        }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      current_user.projects << project

      options = {}
      options[:params] = { current_user: current_user }
      render json: ProjectSerializer.new(project, options).serialized_json
    end
  end

  def update
    project = current_user.projects.find(params[:id])

    if project.update(project_params)
      options = {}
      options[:params] = { current_user: current_user }
      render json: ProjectSerializer.new(project, options).serialized_json
    else
      render json: {
        error: true,
        errors: project.errors.as_json
      }, status: :bad_request
    end
  end

  def show
    project = current_user.projects.find(params[:id])

    options = {}
    options[:params] = { current_user: current_user }
    render json: ProjectSerializer.new(project, options).serialized_json, status: :ok
  end

  def export
    project = current_user.projects.find(params[:project_id])

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
        project.languages.each do |language|
          # Create the file content for a language.
          export_data = {}
          project.keys.each do |key|
            key_translation = key.translations.where(language_id: language.id).first
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
                key_translation = key.translations.where(language_id: parent_language.id).first
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

          if params[:export_type] == 'json'
            language_file = helpers.json(language, export_data)
            zip.add(language.name.downcase + '.json', language_file)
          elsif params[:export_type] == 'typescript'
            language_file = helpers.typescript(language, export_data)
            zip.add(language.name.downcase + '.ts', language_file)
          elsif params[:export_type] == 'android'
            language_file = helpers.android(language, export_data)
            zip.add(language.name.downcase + '.xml', language_file)
          elsif params[:export_type] == 'ios'
            language_file = helpers.ios(language, export_data)
            zip.add(language.name.downcase + '.strings', language_file)
          elsif params[:export_type] == 'rails'
            language_file = helpers.rails(language, export_data)
            zip.add(language.name.downcase + '.yml', language_file)
          else
            language_file = helpers.json(language, export_data)
            zip.add(language.name.downcase + '.json', language_file)
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
    language = project.languages.find(params[:language_id])
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
    project.destroy

    render json: {
      message: 'Project deleted'
    }
  end

  def activity
    limit = 5
    if params[:limit].present?
      limit = params[:limit].to_i || 5
      limit = 1 if limit < 1
      limit = 20 if limit > 20
    end

    project = current_user.projects.find(params[:project_id])
    versions = PaperTrail::Version
               .where(project_id: project.id, whodunnit: current_user.id)
               .limit(limit)
               .order(created_at: :desc)

    options = {}
    options[:include] = [:user, :key, :language, :'language.country_code']
    render json: ActivitySerializer.new(versions, options).serialized_json
  end

  def columns
    project = current_user.projects.find(params[:project_id])
    render json: ProjectColumnSerializer.new(project.project_columns).serialized_json
  end

  private

  def project_params
    params.permit(:name, :description)
  end
end
