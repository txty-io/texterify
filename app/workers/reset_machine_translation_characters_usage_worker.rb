require 'sidekiq-scheduler'

# Resets the translation character usage of the current month.
class ResetMachineTranslationCharactersUsageWorker
  include Sidekiq::Worker

  def perform(*_args)
    if Texterify.cloud? || Rails.env.development? || Rails.env.test?
      Organization.all.each do |organization|
        organization.machine_translation_character_usage = 0
        organization.save!
      end

      Project.all.each do |project|
        project.machine_translation_character_usage = 0
        project.save!
      end
    end
  end
end
