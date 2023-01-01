class ImportImportWorker
  include Sidekiq::Worker

  def perform(background_job_id, project_id, import_id)
    background_job = BackgroundJob.find(background_job_id)
    background_job.start!
    background_job.progress!(20)

    project = Project.find(project_id)
    import = project.imports.find(import_id)
    import_files = import.import_files

    import_files.each do |import_file|
      import_file.import_file_translations.each do |import_file_translation|
        # Update or create key.
        key = project.keys.find_by(name: import_file_translation.key_name)
        if key.nil?
          key = Key.new(name: import_file_translation.key_name)
          key.project_id = project.id
        end
        key.description = import_file_translation.key_description
        key.save!

        # Update or create translation.
        # TODO: Add flavor import support.
        # Load default translation or flavor translation.
        # if flavor
        #   translation = key.translations.find_by(language: language, flavor: flavor)
        # else
        # translation = key.translations.find_by(language: language, flavor: nil)
        # end

        translation = key.translations.find_by(language_id: import_file.language_id, flavor: nil)

        # If there is no translation create a new one.
        if translation.nil?
          translation = Translation.new
          translation.key_id = key.id
          translation.language_id = import_file.language_id

          # TODO: Add flavor import support.
          # if flavor
          #   translation.flavor_id = flavor.id
          # end
        end

        translation.content = import_file_translation.other
        translation.zero = import_file_translation.zero
        translation.one = import_file_translation.one
        translation.two = import_file_translation.two
        translation.few = import_file_translation.few
        translation.many = import_file_translation.many
        translation.save!
      end
    end

    import.status = IMPORT_STATUS_IMPORTED
    import.save!
    background_job.complete!
  end
end
