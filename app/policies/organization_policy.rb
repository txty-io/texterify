class OrganizationPolicy
  attr_reader :user, :organization

  def initialize(user, organization)
    @user = user
    @organization = organization
  end

  def image_create?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  def image_destroy?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  def update?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  def destroy?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  def cancel_subscription?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  def reactivate_subscription?
    ROLES_MANAGER_UP.include? organization_user_role
  end

  private

  def organization_user_role
    organization.role_of(user)
  end
end
