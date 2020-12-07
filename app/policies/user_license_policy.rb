class UserLicensePolicy < Struct.new(:user, :user_license)
  def index?
    true
  end
end
