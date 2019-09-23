class Api::V1::OrganizationUsersController < Api::V1::ApiController
  def index
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    options = {}
    options[:params] = { organization: organization }
    render json: UserSerializer.new(organization.users, options).serialized_json
  end

  def create
    organization = current_user.organizations.find(params[:organization_id])
    user = User.find_by!(email: params[:email])

    organization_user = OrganizationUser.new
    organization_user.organization = organization
    organization_user.user = user
    authorize organization_user

    if !organization.users.include?(user)
      organization_user.save!

      render json: {
        message: 'User added to the organization'
      }
    else
      render json: {
        errors: [
          {
            details: 'User already in the organization'
          }
        ]
      }
    end
  end

  def destroy
    organization = current_user.organizations.find(params[:organization_id])
    organization_user = OrganizationUser.find_by!(user_id: params[:id], organization_id: organization.id)

    if params[:id] == current_user.id
      skip_authorization
    else
      authorize organization_user
    end

    if current_user.id == params[:id] && organization.users.count == 1
      render json: {
        errors: [
          {
            details: "You can't remove yourself from the organization if you are the only member"
          }
        ]
      }, status: :bad_request
      return
    end

    organization_user.destroy

    render json: {
      message: 'User removed from organization'
    }
  end

  def update
    organization = current_user.organizations.find(params[:organization_id])
    organization_user = OrganizationUser.find_by(organization_id: organization.id, user_id: params[:id])

    unless organization_user
      organization_user = OrganizationUser.new
      organization_user.organization = organization
      organization_user.user = User.find(params[:id])
    end

    organization_user.role = params[:role]
    authorize organization_user
    organization_user.save!

    render json: {
      message: 'User role updated'
    }
  end
end
