require 'json'
require 'nokogiri'
require 'yaml'
require 'zip'

# Texterify::Export
module Texterify
  class Export
    # Creates an export data object in the format:
    # {
    #   my.key.name: {
    #     other: '',
    #     zero: '',
    #     one: '',
    #     two: '',
    #     few: '',
    #     many: '',
    #     pluralization_enabled: false,
    #     description: ''
    #   }
    # }
    def self.create_language_export_data(project, export_config, language, post_processing_rules, **args)
      export_data = {}

      # Load the translations for the given language and export config.
      project
        .keys
        .order_by_name
        .each do |key|
          key_translation = key.translation_for(language.id, export_config.id)
          translation_export_data = nil

          if key_translation
            translation_export_data =
              key_translation.to_export_data(key, post_processing_rules, emojify: args[:emojify])
          else
            translation_export_data =
              language_export_data_line_from_simple_string('', pluralization_enabled: key.pluralization_enabled)
          end

          export_data[key.name] = translation_export_data
        end

      # Use translations of parent languages if translation for given language is missing.
      parent_language = language.parent
      while parent_language.present?
        parent_language.keys.each do |key|
          if export_data[key.name].nil? || export_data[key.name][:other].empty?
            key_translation = key.translation_for(parent_language.id, export_config.id)
            translation_export_data = nil

            if key_translation
              translation_export_data =
                key_translation.to_export_data(key, post_processing_rules, emojify: args[:emojify])
            else
              translation_export_data =
                language_export_data_line_from_simple_string('', pluralization_enabled: key.pluralization_enabled)
            end

            export_data[key.name] = translation_export_data
          end
        end

        parent_language = parent_language.parent
      end

      if !args[:skip_timestamp]
        export_data['texterify_timestamp'] = language_export_data_line_from_simple_string(Time.now.utc.iso8601)
      end

      export_data
    end

    # Create a simple export data line from a simple string.
    def self.language_export_data_line_from_simple_string(text, pluralization_enabled: false)
      {
        other: text,
        zero: '',
        one: '',
        two: '',
        few: '',
        many: '',
        pluralization_enabled: pluralization_enabled,
        description: ''
      }
    end

    def self.create_export(project, export_config, file, **args)
      post_processing_rules =
        project.post_processing_rules.where(export_config_id: [export_config.id, nil]).order_by_name
      requires_source_translations = export_config.file_format == 'xliff'
      default_language = project.languages.find_by(is_default: true)

      if requires_source_translations && default_language
        export_data_source =
          create_language_export_data(
            project,
            export_config,
            default_language,
            post_processing_rules,
            skip_timestamp: false,
            emojify: args[:emojify]
          )
      end

      Zip::File.open(file.path, Zip::File::CREATE) do |zip|
        project
          .languages
          .order_by_name
          .each do |language|
            # Create the file content for a language.
            export_data =
              create_language_export_data(
                project,
                export_config,
                language,
                post_processing_rules,
                skip_timestamp: false,
                emojify: args[:emojify]
              )

            export_file_objects =
              export_config.files(
                language,
                export_data,
                default_language,
                export_data_source,
                skip_empty_plural_translations: export_config.skip_empty_plural_translations
              )

            export_file_objects.each do |export_file_object|
              duplicate_zip_entry_count = 0
              loop do
                file_path = export_file_object[:path]

                if duplicate_zip_entry_count > 0
                  file_path += duplicate_zip_entry_count.to_s
                end

                # Remove leading '/' because Zip::EntryNameError is otherwise thrown.
                while file_path.start_with?('/')
                  file_path.delete_prefix!('/')
                end

                zip.add(file_path, export_file_object[:file])
                break
              rescue Zip::EntryExistsError
                duplicate_zip_entry_count += 1
              end
            end
          end
      end
    end
  end
end
