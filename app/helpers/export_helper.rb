require 'json'
require 'nokogiri'
require 'yaml'
require 'zip'

module ExportHelper
  def convert_html_translation(content)
    if content.nil?
      return nil
    end

    json_content = JSON.parse(content)

    if json_content.is_a?(Numeric)
      return json_content
    end

    converted = ''
    json_content['blocks']&.map do |block|
      if block['type'] == 'list'
        if block['data']['style'] == 'ordered'
          converted += '<ol>'
        elsif block['data']['style'] == 'unordered'
          converted += '<ul>'
        end

        block['data']['items'].map { |item| converted += "<li>#{item}</li>" }

        if block['data']['style'] == 'ordered'
          converted += '</ol>'
        elsif block['data']['style'] == 'unordered'
          converted += '</ul>'
        end
      elsif block['type'] == 'paragraph'
        converted += "<p>#{block['data']['text']}</p>"
      end
    end

    converted
  rescue JSON::ParserError
    nil
  end

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
  def create_language_export_data(project, export_config, language, post_processing_rules, **args)
    export_data = {}

    # Load the translations for the given language and export config.
    project
      .keys
      .order_by_name
      .each do |key|
        key_translation = key.translation_for(language.id, export_config.id)
        translation_export_data = nil

        if key_translation
          translation_export_data = key_translation.to_export_data(key, post_processing_rules, args[:emojify])
        end

        export_data[key.name] = translation_export_data
      end

    # Use translations of parent languages if translation for given language is missing.
    parent_language = language.parent
    while parent_language.present?
      parent_language.keys.each do |key|
        if export_data[key.name].nil?
          key_translation = key.translation_for(parent_language.id, export_config.id)

          translation_export_data = nil

          if key_translation
            translation_export_data = key_translation.to_export_data(key, post_processing_rules, args[:emojify])
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
  def language_export_data_line_from_simple_string(text)
    {
      other: text,
      zero: 'zero text',
      one: 'one text',
      two: 'two text',
      few: 'few text',
      many: 'many text',
      pluralization_enabled: false,
      description: 'description text'
    }
  end

  def create_export(project, export_config, file, **args)
    post_processing_rules = project.post_processing_rules.where(export_config_id: [export_config.id, nil]).order_by_name
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

          duplicate_zip_entry_count = 0
          loop do
            file_path = export_config.filled_file_path(language)

            if duplicate_zip_entry_count > 0
              file_path += duplicate_zip_entry_count.to_s
            end

            # Remove leading '/' because Zip::EntryNameError is otherwise thrown.
            while file_path.start_with?('/')
              file_path.delete_prefix!('/')
            end

            zip.add(file_path, export_config.file(language, export_data, default_language, export_data_source))
            break
          rescue Zip::EntryExistsError
            duplicate_zip_entry_count += 1
          end
        end
    end
  end
end
