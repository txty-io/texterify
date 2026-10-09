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
    if organization_user_role == ROLE_OWNER
      return true
    end

    is_higher_than_old_role =
      if organization_user.role_before_update.nil?
        true
      else
        ROLE_PRIORITY_MAP[organization_user_role.to_sym] >
          ROLE_PRIORITY_MAP[organization_user.role_before_update.to_sym]
      end

    is_higher_than_new_role =
      ROLE_PRIORITY_MAP[organization_user_role.to_sym] > ROLE_PRIORITY_MAP[organization_user.role.to_sym]

    is_higher_than_old_role && is_higher_than_new_role
  end

  def organization_user_role
    organization_user.organization.role_of(user)
  end
end
