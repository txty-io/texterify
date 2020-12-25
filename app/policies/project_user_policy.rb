class ProjectUserPolicy
  attr_reader :user, :project_user

  def initialize(user, project_user)
    @user = user
    @project_user = project_user
  end

  def create?
    if higher_role_or_both_highest
      ROLES_MANAGER_UP.include? project_user_role
    else
      false
    end
  end

  def update?
    if higher_role_or_both_highest
      ROLES_MANAGER_UP.include? project_user_role
    else
      false
    end
  end

  def destroy?
    if higher_role_or_both_highest
      ROLES_MANAGER_UP.include? project_user_role
    else
      false
    end
  end

  private

  def higher_role_or_both_highest
    return true if project_user_role == ROLE_OWNER

    is_higher_than_old_role = ROLE_PRIORITY_MAP[project_user_role.to_sym] > ROLE_PRIORITY_MAP[project_user.role_before_update.to_sym]
    is_higher_than_new_role = ROLE_PRIORITY_MAP[project_user_role.to_sym] > ROLE_PRIORITY_MAP[project_user.role.to_sym]

    is_higher_than_old_role && is_higher_than_new_role
  end

  def project_user_role
    if project_user.project.organization
      project_user.project.organization.role_of(user)
    else
      project_user.project.role_of(user)
    end
  end
end
