class LanguagePolicy
  attr_reader :user, :language

  def initialize(user, language)
    @user = user
    @language = language
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

  def machine_translate_language?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  private

  def project_user_role
    language.project.role_of(user)
  end
end
