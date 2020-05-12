class Api::V1::KeysController < Api::V1::ApiController
  def info_for_paper_trail
    { project_id: params[:project_id] }
  end

  def show
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:id])

    options = {}
    options[:include] = [:translations, :'translations.language']
    render json: KeySerializer.new(
      key,
      options
    ).serialized_json
  end

  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

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

    keys = project.keys
    if params[:search]
      keys = project.keys
        .left_outer_joins(:translations)
        .where(
          'name ilike :search or description ilike :search',
          search: "%#{params[:search]}%"
        )
        .or(
          project.keys
          .left_outer_joins(:translations)
          .where(
            'translations.content ilike :search',
            search: "%#{params[:search]}%"
          )
        )
        .distinct
    end

    options = {}
    options[:meta] = { total: keys.count }
    options[:include] = [:translations, :'translations.language']
    render json: KeySerializer.new(
      keys.offset(page * per_page).limit(per_page),
      options
    ).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])

    key = Key.new(key_params)
    key.project = project
    authorize key

    if key.save
      render json: key
    else
      render json: {
        errors: key.errors.details
      }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:id])
    authorize key

    if key.update(permitted_attributes(key))
      render json: {
        message: 'key updated'
      }
    else
      render json: {
        errors: key.errors.details
      }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    key_to_destroy = project.keys.find(params[:key][:id])
    authorize key_to_destroy
    key_to_destroy.destroy

    render json: {
      message: 'Key deleted'
    }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    keys_to_destroy = project.keys.find(params[:keys])
    keys_to_destroy.each { |key| authorize key }
    project.keys.delete(keys_to_destroy)

    render json: {
      message: 'Keys deleted'
    }
  end

  def activity
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:key_id])

    options = {}
    options[:include] = [:translations, :'translations.language', :'translations.language.country_code', :key]
    render json: ActivitySerializer.new(key.translations.map(&:versions).flatten.sort_by(&:created_at).reverse, options).serialized_json
  end

  private

  def key_params
    params.require(:key).permit(:name, :description, :html_enabled)
  end
end
