class Api::V1::UsersController < Api::V1::ApiController
  before_action :check_if_user_activated, except: [:info, :image, :image_create, :image_destroy]

  def info
    skip_authorization

    render json: {
             confirmed: current_user.confirmed,
             version: ENV['COMMIT'],
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
end
