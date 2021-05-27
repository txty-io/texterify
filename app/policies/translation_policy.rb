class TranslationPolicy
  attr_reader :user, :translation

  def initialize(user, translation)
    @user = user
    @translation = translation
  end

  def create?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def update?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def suggestion?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  private

  def project_user_role
    translation.key.project.role_of(user)
  end
end
