class InstancePolicy < Struct.new(:user, :instance)
  def show?
    user.is_superadmin
  end

  def domain_filter?
    user.is_superadmin
  end

  def sign_up_enabled?
    user.is_superadmin
  end
end
