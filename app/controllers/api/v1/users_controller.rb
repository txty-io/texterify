class Api::V1::UsersController < ApplicationController
  def image
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

  def upload_image
    current_user.image.attach(params[:image])
  end
end
