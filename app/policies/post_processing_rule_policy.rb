class PostProcessingRulePolicy
  attr_reader :user, :post_processing_rule

  def initialize(user, post_processing_rule)
    @user = user
    @post_processing_rule = post_processing_rule
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
    post_processing_rule.project.role_of(user)
  end
end
