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

  # Parsed locales in the format of "en_US".
  def parse_locale(locale)
    splitted = locale.split('_')

    language_code = splitted[0]

    if splitted.length == 1
      country_code = nil
    else
      country_code = splitted[1]
    end

    { language_code: language_code, country_code: country_code }
  end
end
