class ImportVerifyWorker
  include Sidekiq::Worker

  def perform(background_job_id, _project_id, import_id)
    background_job = BackgroundJob.find(background_job_id)
    background_job.start!
    background_job.progress!(20)

    import = Import.find(import_id)
    import_files = import.import_files

    has_one_successful_upload = false

    import_files.each do |import_file|
      file_format = import_file.file_format.format

      import_file.file.open do |file|
        file_content = file.read

        begin
          parsed_result = Texterify::Import.parse_file_content(import_file.name, file_content, file_format)

          if parsed_result[:success]
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

              translation =
                import_file.import_file_translations.find_or_initialize_by(
                  import_file_id: import_file.id,
                  key_name: key_name
                )
              translation.other = json_value

              if file_format == 'json-formatjs'
                translation.other = json_value['defaultMessage'] || json_value['message']
                translation.key_description = json_value['description']
              elsif file_format == 'json-poeditor'
                translation.other = json_key['definition']
                translation.key_description = json_key['comment']
              elsif file_format == 'toml' && json_value.is_a?(Hash)
                translation.other = json_value[:value]
                translation.key_description = json_value[:description]
              elsif file_format == 'po' && json_value.is_a?(Hash)
                translation.other = json_value[:value]
                translation.key_description = json_value[:description]
              elsif file_format == 'arb' && json_value.is_a?(Hash)
                translation.other = json_value[:value]
                translation.key_description = json_value[:description]
              else
                translation.other = json_value
              end

              translation.save!
            end
            import_file.status = 'VERIFIED'
            has_one_successful_upload = true
          else
            import_file.status = 'ERROR'
            import_file.status_message = 'ERROR_WHILE_PARSING'
          end
        rescue StandardError => e
          logger.error(e)
          import_file.status = 'ERROR'
          import_file.status_message = 'UNKNOWN_ERROR'
          import_file.error_message = e.message
          Sentry.capture_exception(e)
        end

        import_file.save!
      end
    end

    if has_one_successful_upload
      import.status = IMPORT_STATUS_VERIFIED
    else
      import.status = IMPORT_STATUS_ERROR
    end

    import.save!
    background_job.complete!
  rescue StandardError => e
    import.status = IMPORT_STATUS_ERROR
    import.error_message = e.message
    import.save!
    background_job.error!
  end
end
