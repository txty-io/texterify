class MachineTranslationPolicy < Struct.new(:user, :machine_translaton)
  def usage?
    user.is_superadmin
  end

  def target_languages?
    true
  end

  def source_languages?
    true
  end
end
