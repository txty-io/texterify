class Api::V1::OrganizationsController < Api::V1::ApiController
  def image
    skip_authorization
    organization = Organization.find(params[:organization_id])

    if organization
      render json: { image: organization.image.attached? ? url_for(organization.image) : nil }
    else
      render json: { error: true, message: 'Organization could not be found.' }, status: :bad_request
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

    organizations =
      if params[:search]
        current_user.organizations.where('name ilike :search', search: "%#{params[:search]}%")
      else
        current_user.organizations
      end

    options = {}
    options[:meta] = { total: organizations.size }
    options[:params] = { current_user: current_user }
    render json:
             OrganizationSerializer.new(organizations.order_by_name.offset(page * per_page).limit(per_page), options)
               .serialized_json,
           status: :ok
  end

  def create
    skip_authorization
    organization = Organization.new(organization_params)
    if Texterify.cloud?
      organization.trial_ends_at = (Time.now.utc + 7.days).end_of_day
    end

    ActiveRecord::Base.transaction do
      unless organization.save
        render json: { errors: organization.errors.details }, status: :bad_request
        raise ActiveRecord::Rollback
      end

      organization_user = OrganizationUser.new
      organization_user.user_id = current_user.id
      organization_user.organization_id = organization.id
      organization_user.role = 'owner'
      unless organization_user.save
        render json: { errors: organization_user.errors.details }, status: :bad_request
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
      render json: { errors: organization.errors.details }, status: :bad_request
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

    render json: { message: 'Organization deleted' }
  end

  def subscription
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    render json: SubscriptionSerializer.new(organization.active_subscription).serialized_json, status: :ok
  end

  def custom_subscription
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    render json: CustomSubscriptionSerializer.new(organization.custom_subscription).serialized_json, status: :ok
  end

  def activate_custom_subscription
    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    # Link custom subscription to organization.
    custom_subscription =
      CustomSubscription.find_by(organization_id: nil, redeemable_by_email: current_user.email, id: params[:id])
    custom_subscription.organization = organization
    custom_subscription.save!

    # Cancel any other active subscription.
    organization.active_subscription&.interrupt

    # Also cancel trial if active.
    organization.cancel_trial

    render json: { error: false, message: 'OK' }
  end

  def cancel_subscription
    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    organization.active_subscription&.interrupt

    render json: { success: true }
  end

  def reactivate_subscription
    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    organization.active_subscription&.reactivate

    render json: { success: true }
  end

  def change_subscription_plan
    plan = params[:plan]
    if !plan
      render json: { errors: [{ code: 'NO_PLAN_GIVEN' }] }, status: :bad_request
      return
    end

    organization = current_user.organizations.find(params[:organization_id])
    authorize organization

    organization.active_subscription&.change_plan(plan)

    render json: { success: true }
  end

  private

  def organization_params
    params.permit(:name)
  end
end
