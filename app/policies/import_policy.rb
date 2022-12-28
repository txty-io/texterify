class ImportPolicy
  attr_reader :user, :import

  def initialize(user, import)
    @user = user
    @import = import
  end

  def show?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def verify?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def destroy_multiple?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  private

  def project_user_role
    import.project.role_of(user)
  end
end
