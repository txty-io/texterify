class Api::V1::InstanceUsersController < Api::V1::ApiController
  def index
    authorize :instance_user, :index?

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    users = User.all
    if params[:search]
      users = User.all.where('username ilike :search or email ilike :search', search: "%#{params[:search]}%")
    end

    users = users.order('created_at DESC')

    options = {}
    options[:meta] = { total: users.size }
    render json: InstanceUserSerializer.new(users.offset(page * per_page).limit(per_page), options).serialized_json
  end

  def destroy
    authorize :instance_user, :destroy?

    user = User.find_by(params[:user_id])

    if user.is_superadmin
      render json: { errors: [{ code: 'SUPERADMIN_USER_CANT_BE_DELETED' }] }, status: :forbidden
      return
    end

    if user.delete_account
      render json: { success: true }
    else
      render json: { success: false }, status: :bad_request
    end
  end
end
