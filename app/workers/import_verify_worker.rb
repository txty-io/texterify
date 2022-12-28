class ImportVerifyWorker
  include Sidekiq::Worker

  def perform(background_job_id, project_id, import_id)
    background_job = BackgroundJob.find(background_job_id)
    background_job.start!
    background_job.progress!(20)

    project = Project.find(project_id)
    import = Import.find(import_id)
    import_files = import.import_files

    import_files.each do |import_file|
      file_format = import_file.file_format.format
      language = import_file.language

      import_file.file.open do |file|
        file_content = file.read

        parsed_result = Texterify::Import.parse_file_content(import_file.name, file_content, file_format)

        # unless parse_result[:success]
        #   render json: parse_result, status: :bad_request
        #   return
        # end

        parsed_result[:content].each do |json_key, json_value|
          if file_format == 'json-poeditor'
            key_name = "#{json_key['context']}.#{json_key['term']}"
          else
            key_name = json_key
          end

          # Skip "texterify_" keys because they are reserved and can't be imported.
          if key_name.start_with?('texterify_')
            next
          end

          key = project.keys.find_by(name: key_name)

          if key.present?
            # Load default translations or export config translations.
            # if flavor
            #   translation = key.translations.find_by(language: language, flavor: flavor)
            # else
            translation = key.translations.find_by(language: language, flavor: nil)

            # end

            # If there is no translation create a new one
            if translation.nil?
              translation = Translation.new
              translation.content = json_value
              translation.key_id = key.id
              translation.language_id = language.id

              # if flavor
              #   translation.flavor_id = flavor.id
              # end
            end

            if file_format == 'json-formatjs'
              translation.content = json_value['defaultMessage'] || json_value['message']

              key.description = json_value['description']
              key.save
            elsif file_format == 'json-poeditor'
              translation.content = json_key['definition']

              key.description = json_key['comment']
              key.save
            elsif file_format == 'toml' && json_value.is_a?(Hash)
              translation.content = json_value[:value]

              key.description = json_value[:description]
              key.save
            elsif file_format == 'po' && json_value.is_a?(Hash)
              translation.content = json_value[:value]

              key.description = json_value[:description]
              key.save
            elsif file_format == 'arb' && json_value.is_a?(Hash)
              translation.content = json_value[:value]

              key.description = json_value[:description]
              key.save
            else
              translation.content = json_value
            end

            translation.save
          else
            key = Key.new(name: key_name)
            key.project_id = project.id

            if file_format == 'json-formatjs'
              key.description = json_value['description']
            elsif file_format == 'json-poeditor'
              key.description = json_key['comment']
            elsif file_format == 'toml' && json_value.is_a?(Hash)
              key.description = json_value[:description]
            elsif file_format == 'po' && json_value.is_a?(Hash)
              key.description = json_value[:description]
            elsif file_format == 'arb' && json_value.is_a?(Hash)
              key.description = json_value[:description]
            end

            if key.save
              translation = Translation.new
              translation.key_id = key.id
              translation.language_id = language.id

              # if flavor
              #   translation.flavor_id = flavor.id
              # end

              if file_format == 'json-formatjs'
                translation.content = json_value['defaultMessage']
              elsif file_format == 'json-poeditor'
                translation.content = json_key['definition']
              elsif file_format == 'toml' && json_value.is_a?(Hash)
                translation.content = json_value[:value]
              elsif file_format == 'po' && json_value.is_a?(Hash)
                translation.content = json_value[:value]
              elsif file_format == 'arb' && json_value.is_a?(Hash)
                translation.content = json_value[:value]
              else
                translation.content = json_value
              end

              translation.save!
            end
          end
        end
      end

      import_file.status = 'VERIFIED'
      import_file.save!
    end

    import.status = 'VERIFIED'
    import.save!
    background_job.complete!
  end
end
