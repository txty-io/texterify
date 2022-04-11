class ForbiddenWordsListPolicy
  attr_reader :user, :forbidden_word_list

  def initialize(user, forbidden_word_list)
    @user = user
    @forbidden_word_list = forbidden_word_list
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

  private

  def project_user_role
    forbidden_word_list.project.role_of(user)
  end
end
