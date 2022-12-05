class Api::V1::ImportsController < Api::V1::ApiController
  def create
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    import = Import.new(import_params)
    import.name = params[:files].map { |f| f.original_filename }.join(', ')
    import.user = current_user
    import.project = project
    import.status = 'PENDING'
    import.save!

    if import.save
      options = {}
      options[:include] = [:user]
      render json: ImportSerializer.new(import, options).serialized_json
    else
      render json: { error: true, errors: import.errors.details }, status: :bad_request
    end
  end

  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    imports = project.imports.order(created_at: :desc)

    options = {}
    options[:meta] = { total: imports.size }
    options[:include] = [:user]
    render json: ImportSerializer.new(imports.offset(page * per_page).limit(per_page), options).serialized_json
  end

  def show
    project = current_user.projects.find(params[:project_id])
    import = project.imports.find(params[:id])

    authorize import

    options = {}
    options[:include] = [:user]
    render json: ImportSerializer.new(import).serialized_json
  end

  def destroy_multiple
    skip_authorization
  end

  private

  def import_params
    params.permit(files: [])
  end
end
