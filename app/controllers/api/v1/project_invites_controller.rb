class Api::V1::ProjectInvitesController < Api::V1::ApiController
  before_action :ensure_feature_enabled, only: [:create]

  def create
    project = current_user.projects.find(params[:project_id])
    email = params[:email]
    role = params[:role]

    if role && ROLE_PRIORITY_MAP[role.to_sym].nil?
      render json: { error: true, message: 'ROLE_NOT_FOUND' }, status: :bad_request
      return
    end

    project_invite = ProjectInvite.new
    project_invite.project = project
    project_invite.email = email
    project_invite.role = role || ROLE_TRANSLATOR
    authorize project_invite

    # Check if there is already an invite for this project or the user is already part of the project.
    if ProjectInvite.exists?(project_id: project.id, email: email, open: true) || project.users.exists?(email: email)
      render json: { error: true, message: 'USER_ALREADY_INVITED_OR_ADDED' }, status: :bad_request
    else
      project_invite.save!

      UserMailer.invite(email, current_user.username, Txty.on_premise?).deliver_later

      render json: { error: false, message: 'OK' }
    end
  end

  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    project_invites = project.invites.where(open: true).order(created_at: :desc)

    render json: ProjectInviteSerializer.new(project_invites).serialized_json
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    project_invite = ProjectInvite.find_by(id: params[:id], project_id: project.id)

    unless project_invite
      skip_authorization
      render json: { error: true, message: 'NOT_FOUND' }, status: :bad_request
      return
    end

    authorize project_invite

    project_invite.destroy

    render json: { error: false, message: 'OK' }
  end

  private

  def ensure_feature_enabled
    project = current_user.projects.find(params[:project_id])

    if !project.feature_enabled?(Plan::FEATURE_PERMISSION_SYSTEM)
      skip_authorization

      render json: { error: true, message: 'BASIC_PERMISSION_SYSTEM_FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end
  end
end
