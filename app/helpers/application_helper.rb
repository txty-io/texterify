# frozen_string_literal: true

module ApplicationHelper
  def higher_role?(role_x, role_y)
    if !role_x || !role_y
      false
    end

    ROLE_PRIORITY_MAP[role_x.to_sym] > ROLE_PRIORITY_MAP[role_y.to_sym]
  end

  def roles_below(role)
    if role == 'owner'
      ROLES_BELOW_OWNER
    elsif role == 'manager'
      ROLES_BELOW_MANAGER
    elsif role == 'developer'
      ROLES_BELOW_DEVELOPER
    else
      ROLES_BELOW_TRANSLATOR
    end
  end
end
