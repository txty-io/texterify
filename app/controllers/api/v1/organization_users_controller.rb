class Api::V1::OrganizationUsersController < Api::V1::ApiController
  before_action :ensure_feature_enabled, only: [:create, :update]

  def index
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    organization_users =
      if params[:search]
        organization.users.where(
          'users.username ilike :search or users.email ilike :search',
          search: "%#{params[:search]}%"
        )
      else
        organization.users
      end

    options = {}
    options[:params] = { organization: organization }
    render json: UserSerializer.new(organization_users, options).serialized_json
  end

  def project_users
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])

    project_users =
      if params[:search]
        organization
          .project_users
          .joins(:user)
          .where('users.username ilike :search or users.email ilike :search', search: "%#{params[:search]}%")
      else
        organization.project_users
      end

    options = {}
    options[:include] = [:project, :user]
    render json: ProjectUserSerializer.new(project_users, options).serialized_json
  end

  def create
    organization = current_user.organizations.find(params[:organization_id])
    user = User.find_by(email: params[:email])

    unless user
      skip_authorization
      render json: { error: true, message: 'USER_NOT_FOUND' }, status: :not_found
      return
    end

    organization_user = OrganizationUser.new
    organization_user.organization = organization
    organization_user.user = user
    authorize organization_user

    if organization.users.exclude?(user)
      organization_user.save!

      render json: { error: false, message: 'OK' }
    else
      render json: { error: true, message: 'USER_ALREADY_ADDED' }, status: :bad_request
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
               errors: [{ details: "You can't remove yourself from the organization if you are the only member" }]
             },
             status: :bad_request
      return
    end

    if organization.owners_count == 1 && organization.owner?(organization_user.user)
      render json: { error: true, message: 'LAST_OWNER_CANT_BE_REMOVED' }, status: :bad_request
      return
    end

    organization_user.destroy

    render json: { message: 'User removed from organization' }
  end

  def update
    organization = current_user.organizations.find(params[:organization_id])
    organization_user = OrganizationUser.find_by(organization_id: organization.id, user_id: params[:id])

    unless organization_user
      organization_user = OrganizationUser.new
      organization_user.organization = organization
      organization_user.user = User.find(params[:id])
    end

    old_role = organization_user.role
    organization_user.role = params[:role]

    authorize organization_user

    # Don't allow the last owner of the organization to change his role.
    # There should always be at least one owner.
    if organization.organization_users.where(role: 'owner').size == 1 && organization_user.role_changed? &&
         organization_user.role_was == 'owner'
      render json: {
               errors: [{ details: 'There must always be at least one owner in an organization.' }]
             },
             status: :bad_request
      return
    end

    # Remove user project roles which are below the users organization role.
    if helpers.higher_role?(organization_user.role, old_role)
      organization
        .project_users
        .where(user_id: organization_user.user.id, role: helpers.roles_below(organization_user.role))
        .destroy_all
    end

    organization_user.save!

    render json: { message: 'User role updated' }
  end

  private

  def ensure_feature_enabled
    organization = current_user.organizations.find(params[:organization_id])

    if !organization.feature_enabled?(Organization::FEATURE_BASIC_PERMISSION_SYSTEM)
      skip_authorization

      render json: { error: true, message: 'BASIC_PERMISSION_SYSTEM_FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end
  end
end
