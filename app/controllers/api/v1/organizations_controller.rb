class Api::V1::OrganizationsController < Api::V1::ApiController
  def image
    skip_authorization
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
    authorize organization
    organization.image.attach(params[:image])
  end

  def image_destroy
    organization = Organization.find(params[:organization_id])
    authorize organization
    organization.image.purge
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
    skip_authorization
    organization = Organization.new(organization_params)

    ActiveRecord::Base.transaction do
      unless organization.save
        render json: {
          errors: organization.errors.details
        }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      organization_user = OrganizationUser.new
      organization_user.user_id = current_user.id
      organization_user.organization_id = organization.id
      organization_user.role = 'owner'
      unless organization_user.save
        render json: {
          errors: organization_user.errors.details
        }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      options = {}
      options[:params] = { current_user: current_user }
      render json: OrganizationSerializer.new(organization, options).serialized_json
    end
  end

  def update
    organization = current_user.organizations.find(params[:id])
    authorize organization

    if organization.update(organization_params)
      options = {}
      options[:params] = { current_user: current_user }
      render json: OrganizationSerializer.new(organization, options).serialized_json
    else
      render json: {
        errors: organization.errors.details
      }, status: :bad_request
    end
  end

  def show
    skip_authorization
    organization = current_user.organizations.find(params[:id])

    options = {}
    options[:params] = { current_user: current_user }
    options[:include] = [:projects]
    render json: OrganizationSerializer.new(organization, options).serialized_json, status: :ok
  end

  def destroy
    organization = current_user.organizations.find(params[:id])
    authorize organization
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
