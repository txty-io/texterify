class ReleasePolicy
  attr_reader :user, :release

  def initialize(user, release)
    @user = user
    @release = release
  end

  def index?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def create?
    ROLES_MANAGER_UP.include? project_user_role
  end

  private

  def project_user_role
    release.project.role_of(user)
  end
end
