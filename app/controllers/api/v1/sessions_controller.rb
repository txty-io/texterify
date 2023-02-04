class Api::V1::SessionsController < DeviseTokenAuth::SessionsController
  def create
    super do |user|
      if user.deactivated
        render json: { error: true, error_type: 'USER_IS_DEACTIVATED' }, status: :forbidden
        return
      end
    end
  end
end
