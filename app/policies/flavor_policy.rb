class FlavorPolicy
  attr_reader :user, :flavor

  def initialize(user, flavor)
    @user = user
    @flavor = flavor
  end

  def index?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def create?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def update?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def destroy?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def destroy_multiple?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  private

  def project_user_role
    flavor.project.role_of(user)
  end
end
