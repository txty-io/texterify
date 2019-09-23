class OrganizationUserPolicy
  attr_reader :user, :organization_user

  def initialize(user, organization_user)
    @user = user
    @organization_user = organization_user
  end

  def create?
    if higher_role_or_both_highest
      ROLES_MANAGER_UP.include? organization_user_role
    else
      false
    end
  end

  def update?
    if higher_role_or_both_highest
      ROLES_MANAGER_UP.include? organization_user_role
    else
      false
    end
  end

  def destroy?
    if higher_role_or_both_highest
      ROLES_MANAGER_UP.include? organization_user_role
    else
      false
    end
  end

  private

  def higher_role_or_both_highest
    is_higher = ROLE_PRIORITY_MAP[organization_user_role.to_sym] > ROLE_PRIORITY_MAP[organization_user.role.to_sym]

    is_higher || organization_user_role == ROLE_OWNER
  end

  def organization_user_role
    organization_user.organization.role_of(user)
  end
end
