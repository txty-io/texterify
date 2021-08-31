class Api::V1::OrganizationInvitesController < Api::V1::ApiController
  before_action :ensure_feature_enabled, only: [:create]

  def create
    organization = current_user.organizations.find(params[:organization_id])
    email = params[:email]
    role = params[:role]

    if role && ROLE_PRIORITY_MAP[role.to_sym].nil?
      render json: { error: true, message: 'ROLE_NOT_FOUND' }, status: :bad_request
      return
    end

    organization_invite = OrganizationInvite.new
    organization_invite.organization = organization
    organization_invite.email = email
    organization_invite.role = role || ROLE_TRANSLATOR
    authorize organization_invite

    # Check if there is already an invite for this organization or the user is already part of the organization.
    if OrganizationInvite.exists?(organization_id: organization.id, email: email, open: true) ||
         organization.users.exists?(email: email)
      render json: { error: true, message: 'USER_ALREADY_INVITED_OR_ADDED' }, status: :bad_request
    else
      organization_invite.save!

      UserMailer.invite(email, current_user.username, Texterify.on_premise?).deliver_later

      render json: { error: false, message: 'OK' }
    end
  end

  def index
    skip_authorization
    organization = current_user.organizations.find(params[:organization_id])
    organization_invites = organization.invites.where(open: true).order(created_at: :desc)

    render json: OrganizationInviteSerializer.new(organization_invites).serialized_json
  end

  def destroy
    organization = current_user.organizations.find(params[:organization_id])
    organization_invite = OrganizationInvite.find_by(id: params[:id], organization_id: organization.id)

    unless organization_invite
      skip_authorization
      render json: { error: true, message: 'NOT_FOUND' }, status: :bad_request
      return
    end

    authorize organization_invite

    organization_invite.destroy

    render json: { error: false, message: 'OK' }
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
