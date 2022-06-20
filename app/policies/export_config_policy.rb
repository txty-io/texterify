class ExportConfigPolicy
  attr_reader :user, :export_config

  def initialize(user, export_config)
    @user = user
    @export_config = export_config
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
    export_config.project.role_of(user)
  end
end
