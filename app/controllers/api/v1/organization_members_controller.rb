class Api::V1::OrganizationMembersController < Api::V1::ApiController
  before_action :check_if_allowed, except: [:index]

  def index
    organization = current_user.organizations.find(params[:organization_id])
    render json: UserSerializer.new(organization.users).serialized_json
  end

  def create
    organization = current_user.organizations.find(params[:organization_id])
    user = User.find_by!(email: params[:email])

    if !organization.users.include?(user)
      organization.users << user
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
      message: 'User removed from team'
    }
  end

  private

  def check_if_allowed
    true
  end
end
