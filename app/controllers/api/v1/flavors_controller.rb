class Api::V1::FlavorsController < Api::V1::ApiController
  def index
    project = current_user.projects.find(params[:project_id])

    authorize Flavor.new(project_id: project.id)

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    flavors = project.flavors.order_by_name

    options = {}
    options[:meta] = { total: flavors.size }
    options[:include] = []
    render json: FlavorSerializer.new(flavors.offset(page * per_page).limit(per_page), options).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])

    flavor = Flavor.new(flavor_params)
    flavor.project = project

    authorize flavor

    if flavor.save
      render json: FlavorSerializer.new(flavor).serialized_json
    else
      render json: { error: true, errors: flavor.errors.details }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    flavor = project.flavors.find(params[:id])

    authorize flavor

    if flavor.update(flavor_params)
      render json: FlavorSerializer.new(flavor).serialized_json
    else
      render json: { error: true, errors: flavor.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    flavor = project.flavors.find(params[:id])

    authorize flavor

    if flavor.destroy
      render json: { error: false, details: 'FLAVOR_DELETED' }
    else
      # :nocov:
      render json: { error: true, errors: flavor.errors.details }, status: :bad_request
      # :nocov:
    end
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])

    flavors_to_destroy = project.flavors.find(params[:flavors])
    flavors_to_destroy.each { |flavor| authorize flavor }

    project.flavors.destroy(flavors_to_destroy)

    render json: { error: false, details: 'FLAVORS_DELETED' }
  end

  private

  def flavor_params
    params.require(:flavor).permit(:name)
  end
end
