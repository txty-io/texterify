class LanguageConfigPolicy
  attr_reader :user, :language_config

  def initialize(user, language_config)
    @user = user
    @language_config = language_config
  end

  def index?
    ROLES_DEVELOPER_UP.include? project_user_role
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

  private

  def project_user_role
    language_config.export_config.project.role_of(user)
  end
end
