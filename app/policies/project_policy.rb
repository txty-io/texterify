class ProjectPolicy
  attr_reader :user, :project

  def initialize(user, project)
    @user = user
    @project = project
  end

  def image_create?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def image_destroy?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def update?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def export?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def import?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def check_placeholders?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def destroy?
    ROLES_OWNER_UP.include? project_user_role
  end

  def transfer?
    ROLES_OWNER_UP.include? project_user_role
  end

  def activity?
    true
  end

  private

  def project_user_role
    project.role_of(user)
  end
end
