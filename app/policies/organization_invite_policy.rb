class OrganizationInvitePolicy
  attr_reader :user, :organization_invite

  def initialize(user, organization_invite)
    @user = user
    @organization_invite = organization_invite
  end

  def create?
    is_user_role_higher_than_invite_role =
      ROLE_PRIORITY_MAP[organization_user_role.to_sym] > ROLE_PRIORITY_MAP[organization_invite.role.to_sym]

    if is_user_role_higher_than_invite_role
      ROLES_MANAGER_UP.include? organization_user_role
    else
      false
    end
  end

  def destroy?
    is_user_role_higher_than_invite_role =
      ROLE_PRIORITY_MAP[organization_user_role.to_sym] > ROLE_PRIORITY_MAP[organization_invite.role.to_sym]

    if is_user_role_higher_than_invite_role
      ROLES_MANAGER_UP.include? organization_user_role
    else
      false
    end
  end

  private

  def organization_user_role
    organization_invite.organization.role_of(user)
  end
end
