class InstancePolicy < Struct.new(:user, :instance)
  def show?
    user.is_superadmin
  end
end
