class Translation < ApplicationRecord
  has_paper_trail

  default_scope { order(created_at: :desc) }

  belongs_to :key
  belongs_to :language
  belongs_to :export_config, optional: true

  # Checks all enabled validations and creates violations if necessary.
  def check_validations
    project = key.project

    check_leading_whitespace(project)
    check_trailing_whitespace(project)
    check_double_whitespace(project)
    check_https(project)

    project.validations.where(enabled: true).each do |validation|
      active_violation = ValidationViolation.find_by(project_id: project.id, translation_id: self.id, validation_id: validation.id)

      matches = false
      if validation.match == 'contains'
        matches = self.content.include?(validation.content)
      elsif validation.match == 'equals'
        matches = self.content == validation.content
      end

      if matches
        if !active_violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, validation_id: validation.id)
        end
      else
        active_violation&.destroy!
      end
    end
  end

  # Checks if the translation starts with a whitespace.
  def check_leading_whitespace(project)
    if project.validate_leading_whitespace
      violation = ValidationViolation.find_by(project_id: project.id, translation_id: self.id, name: 'validate_leading_whitespace')

      if self.content.starts_with?(' ')
        if !violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, name: 'validate_leading_whitespace')
        end
      else
        violation&.destroy!
      end
    end
  end

  # Checks if the translation ends with a whitespace.
  def check_trailing_whitespace(project)
    if project.validate_trailing_whitespace
      violation = ValidationViolation.find_by(project_id: project.id, translation_id: self.id, name: 'validate_trailing_whitespace')

      if self.content.ends_with?(' ')
        if !violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, name: 'validate_trailing_whitespace')
        end
      else
        violation&.destroy!
      end
    end
  end

  # Checks if the translation contains a double whitespace.
  def check_double_whitespace(project)
    if project.validate_double_whitespace
      violation = ValidationViolation.find_by(project_id: project.id, translation_id: self.id, name: 'validate_double_whitespace')

      if self.content.include?('  ')
        if !violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, name: 'validate_double_whitespace')
        end
      else
        violation&.destroy!
      end
    end
  end

  # Checks if the translation contains the string "http://" which indicates an insecure link.
  def check_https(project)
    if project.validate_https
      violation = ValidationViolation.find_by(project_id: project.id, translation_id: self.id, name: 'validate_https')

      if self.content.include?('http://')
        if !violation
          ValidationViolation.create!(project_id: project.id, translation_id: self.id, name: 'validate_https')
        end
      else
        violation&.destroy!
      end
    end
  end
end
