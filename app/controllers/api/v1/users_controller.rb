class Api::V1::UsersController < Api::V1::ApiController
  def image
    skip_authorization
    user = User.find(params[:userId])

    if user
      render json: {
        image: user.image.attached? ? url_for(user.image) : nil
      }
    else
      render json: {
        error: true,
        message: 'User could not be found.'
      }, status: :bad_request
    end
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
