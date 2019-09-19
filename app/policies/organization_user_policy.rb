class OrganizationUserPolicy
  attr_reader :user, :organization_user

  def initialize(user, organization_user)
    @user = user
    @organization_user = organization_user
  end

  def create?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  def update?
    ROLES_MANAGER_UP.include? project_user_role
  end

  def destroy?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  private

  def organization_user_role
    organization_user.organization.role_of(user)
  end
end
