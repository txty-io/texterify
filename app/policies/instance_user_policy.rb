class InstanceUserPolicy < Struct.new(:user, :instance_user)
  def index?
    user.is_superadmin
  end
end
