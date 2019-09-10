class Api::V1::OrganizationsController < Api::V1::ApiController
  def image
    organization = Organization.find(params[:organization_id])

    if organization
      render json: {
        image: organization.image.attached? ? url_for(organization.image) : nil
      }
    else
      render json: {
        error: true,
        message: 'Organization could not be found.'
      }, status: :bad_request
    end
  end

  def image_create
    organization = Organization.find(params[:organization_id])
    organization.image.attach(params[:image])
  end

  def image_destroy
    organization = Organization.find(params[:organization_id])
    organization.image.purge
  end

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

    organizations = if params[:search]
                      current_user.organizations.where(
                        'name ilike :search',
                        search: "%#{params[:search]}%"
                      ).order(:name)
                    else
                      current_user.organizations.order(:name)
                    end

    options = {}
    options[:meta] = { total: organizations.count }
    options[:params] = { current_user: current_user }
    render json: OrganizationSerializer.new(organizations.offset(page * per_page).limit(per_page), options).serialized_json, status: :ok
  end

  def create
    organization = Organization.new(organization_params)

    ActiveRecord::Base.transaction do
      unless organization.save
        render json: {
          errors: organization.errors.full_messages.map { |error| "#{error}." }
        }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      current_user.organizations << organization

      options = {}
      options[:params] = { current_user: current_user }
      render json: OrganizationSerializer.new(organization, options).serialized_json
    end
  end

  def update
    organization = current_user.organizations.find(params[:id])

    if organization.update(organization_params)
      options = {}
      options[:params] = { current_user: current_user }
      render json: OrganizationSerializer.new(organization, options).serialized_json
    else
      render json: {
        error: true,
        errors: organization.errors.as_json
      }, status: :bad_request
    end
  end

  def show
    organization = current_user.organizations.find(params[:id])

    options = {}
    options[:params] = { current_user: current_user }
    options[:include] = [:projects]
    render json: OrganizationSerializer.new(organization, options).serialized_json, status: :ok
  end

  def destroy
    organization = current_user.organizations.find(params[:id])
    organization.destroy

    render json: {
      message: 'Organization deleted'
    }
  end

  private

  def organization_params
    params.permit(:name)
  end
end
