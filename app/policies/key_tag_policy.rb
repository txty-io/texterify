class KeyTagPolicy
  attr_reader :user, :key_tag

  def initialize(user, key_tag)
    @user = user
    @key_tag = key_tag
  end

  def create?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def destroy?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  private

  def project_user_role
    key_tag.key.project.role_of(user)
  end
end
