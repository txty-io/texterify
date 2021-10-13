class KeyPolicy
  attr_reader :user, :key

  def permitted_attributes
    if ROLES_DEVELOPER_UP.include? project_user_role
      [:name, :description, :html_enabled, :pluralization_enabled]
    else
      [:description]
    end
  end

  def initialize(user, key)
    @user = user
    @key = key
  end

  def create?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def update?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def destroy?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def destroy_multiple?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  private

  def project_user_role
    key.project.role_of(user)
  end
end
