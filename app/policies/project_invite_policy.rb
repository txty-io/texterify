class ProjectInvitePolicy
  attr_reader :user, :project_invite

  def initialize(user, project_invite)
    @user = user
    @project_invite = project_invite
  end

  def create?
    is_user_role_higher_than_invite_role =
      ROLE_PRIORITY_MAP[project_user_role.to_sym] > ROLE_PRIORITY_MAP[project_invite.role.to_sym]

    if is_user_role_higher_than_invite_role
      ROLES_MANAGER_UP.include? project_user_role
    else
      false
    end
  end

  def destroy?
    is_user_role_higher_than_invite_role =
      ROLE_PRIORITY_MAP[project_user_role.to_sym] > ROLE_PRIORITY_MAP[project_invite.role.to_sym]

    if is_user_role_higher_than_invite_role
      ROLES_MANAGER_UP.include? project_user_role
    else
      false
    end
  end

  private

  def project_user_role
    project_invite.project.role_of(user)
  end
end
