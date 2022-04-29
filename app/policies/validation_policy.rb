class ValidationPolicy
  attr_reader :user, :validation

  def initialize(user, validation)
    @user = user
    @validation = validation
  end

  def create?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def update?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def destroy?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def destroy_multiple?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def recheck?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  private

  def project_user_role
    validation.project&.role_of(user) || validation.organization&.role_of(user)
  end
end
