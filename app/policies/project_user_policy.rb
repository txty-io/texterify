class ProjectUserPolicy
  attr_reader :user, :project_user

  def initialize(user, project_user)
    @user = user
    @project_user = project_user
  end

  def create?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def update?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def destroy?
    ROLES_MANAGER_UP.include? project_user_role
  end

  private

  def project_user_role
    project_user.project.role_of(user)
  end
end
