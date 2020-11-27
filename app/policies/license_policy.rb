class LicensePolicy
  attr_reader :user, :license

  def initialize(user, license)
    @user = user
    @license = license
  end

  def index?
    user.is_superadmin
  end

  def create?
    user.is_superadmin
  end

  def destroy?
    user.is_superadmin
  end
end
