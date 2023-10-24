class Api::V1::UsersController < Api::V1::ApiController
  before_action :check_if_user_activated, except: [:info, :image, :image_create, :image_destroy]

  def info
    skip_authorization

    render json: {
             confirmed: current_user.confirmed,
             version: ENV.fetch('COMMIT', nil),
             redeemable_custom_subscriptions:
               CustomSubscriptionSerializer.new(
                 CustomSubscription.where(organization_id: nil, redeemable_by_email: current_user.email)
               )
           }
  end

  def image
    skip_authorization
    user = User.find(params[:userId])

    render json: { image: user.image.attached? ? url_for(user.image) : nil }
  end

  def image_create
    skip_authorization
    current_user.image.attach(params[:image])
  end

  def image_destroy
    skip_authorization
    current_user.image.purge
  end

  def deactivate
    skip_authorization
    unless current_user.is_superadmin
      render json: { errors: [{ code: 'SUPERADMIN_PERMISSION_REQUIRED' }] }, status: :forbidden
      return
    end

    user = User.find(params[:id])

    if user.is_superadmin
      render json: { errors: [{ code: 'SUPERADMINS_CANT_BE_DEACTIVATED' }] }, status: :forbidden
      return
    end

    user.deactivated = true
    user.save!

    render json: { error: false, details: 'USER_DEACTIVATED' }
  end

  def activate
    skip_authorization
    unless current_user.is_superadmin
      render json: { errors: [{ code: 'SUPERADMIN_PERMISSION_REQUIRED' }] }, status: :forbidden
      return
    end

    user = User.find(params[:id])
    user.deactivated = false
    user.save!

    render json: { error: false, details: 'USER_ACTIVATED' }
  end

  def destroy
    skip_authorization

    if current_user.delete_account
      render json: { success: true }
    else
      render json: { success: false }, status: :bad_request
    end
  end
end
