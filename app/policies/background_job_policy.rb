class BackgroundJobPolicy
  attr_reader :user, :background_job

  def initialize(user, background_job)
    @user = user
    @background_job = background_job
  end

  def index?
    ROLES_TRANSLATOR_UP.include? project_user_role
  end

  private

  def project_user_role
    background_job.project.role_of(user)
  end
end
