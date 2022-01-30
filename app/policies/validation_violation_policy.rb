class ValidationViolationPolicy
  attr_reader :user, :validation_violation

  def initialize(user, validation_violation)
    @user = user
    @validation_violation = validation_violation
  end

  def destroy?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def destroy_multiple?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def update?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  def update_multiple?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  private

  def project_user_role
    validation_violation.project.role_of(user)
  end
end
