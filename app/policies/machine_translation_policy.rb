class MachineTranslationPolicy < Struct.new(:user, :machine_translaton)
  def usage?
    user.is_superadmin
  end

  def target_languages?
    user.is_superadmin
  end

  def source_languages?
    user.is_superadmin
  end
end
