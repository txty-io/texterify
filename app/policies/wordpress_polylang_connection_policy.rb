class WordpressPolylangConnectionPolicy
  attr_reader :user, :connection

  def initialize(user, connection)
    @user = user
    @connection = connection
  end

  def show?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def update?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def pull?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def website_reachable?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  def wordpress_rest_activated?
    ROLES_DEVELOPER_UP.include? project_user_role
  end

  private

  def project_user_role
    connection.project.role_of(user)
  end
end
