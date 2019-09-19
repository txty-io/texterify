class Api::V1::OrganizationUsersController < Api::V1::ApiController
  def index
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])
    render json: UserSerializer.new(organization.users).serialized_json
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
    authorize organization

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

    member_to_remove = organization.users.find(params[:id])
    organization.users.delete(member_to_remove)

    render json: {
      message: 'User removed from organization'
    }
  end
end
