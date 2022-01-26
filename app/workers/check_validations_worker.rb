# Checks the translations of a project for validation issues.
# If a validation is given only the given validation will be checked.
class CheckValidationsWorker
  include Sidekiq::Worker

  def perform(project_id, validation_id = nil)
    project = Project.find(project_id)

    if validation_id
      validation = Validation.find(validation_id)
      project.translations.each { |translation| translation.check_validations(validation) }
    else
      project.translations.each { |translation| translation.check_validations }
    end
  end
end
