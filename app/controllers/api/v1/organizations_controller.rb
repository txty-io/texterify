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

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    organizations = if params[:search]
                      current_user.organizations.where(
                        'name ilike :search',
                        search: "%#{params[:search]}%"
                      )
                    else
                      current_user.organizations
                    end

    options = {}
    options[:meta] = { total: organizations.size }
    options[:params] = { current_user: current_user }
    render json: OrganizationSerializer.new(organizations.order_by_name.offset(page * per_page).limit(per_page), options).serialized_json, status: :ok
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
    options[:include] = [:projects, :subscriptions]
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

  def subscription
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    options = {}
    render json: SubscriptionSerializer.new(organization.subscription, options).serialized_json, status: :ok
  end

  def cancel_subscription
    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    organization.subscription&.interrupt

    render json: {
      success: true
    }
  end

  def reactivate_subscription
    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    organization.subscription&.reactivate

    render json: {
      success: true
    }
  end

  private

  def organization_params
    params.permit(:name)
  end
end
