require 'json'
require 'nokogiri'
require 'yaml'
require 'zip'

module ExportHelper
  def convert_html_translation(content)
    json_content = JSON.parse(content)

    if json_content.is_a?(Numeric)
      return json_content
    end

    converted = ''
    json_content['blocks'].map do |block|
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
    ''
  end

  def create_language_export_data(project, export_config, language, post_processing_rules, **args)
    export_data = {}
    project
      .keys
      .order_by_name
      .each do |key|
        key_translation_export_config =
          key
            .translations
            .where(language_id: language.id, export_config_id: export_config.id)
            .order(created_at: :desc)
            .first
        if key_translation_export_config&.content.present?
          key_translation = key_translation_export_config
        else
          key_translation =
            key.translations.where(language_id: language.id, export_config_id: nil).order(created_at: :desc).first
        end

        content = ''
        if key_translation.nil?
          content = ''
        elsif key.html_enabled
          content = convert_html_translation(key_translation.content)
        else
          content = key_translation.content
        end

        post_processing_rules.each do |post_processing_rule|
          content = content.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
        end

        if args[:emojify]
          content.gsub!(/[^\s]/, '❤️')
        end

        export_data[key.name] = content
      end

    # Use translations of parent languages if translation is missing.
    parent_language = language.parent
    while parent_language.present?
      parent_language.keys.each do |key|
        if export_data[key.name].blank?
          key_translation_export_config =
            key
              .translations
              .where(language_id: parent_language.id, export_config_id: export_config.id)
              .order(created_at: :desc)
              .first
          if key_translation_export_config&.content.present?
            key_translation = key_translation_export_config
          else
            key_translation =
              key
                .translations
                .where(language_id: parent_language.id, export_config_id: nil)
                .order(created_at: :desc)
                .first
          end

          content = ''
          if key_translation.nil?
            content = ''
          elsif key.html_enabled
            content = convert_html_translation(key_translation.content)
          else
            content = key_translation.content
          end

          post_processing_rules.each do |post_processing_rule|
            content = content.gsub(post_processing_rule.search_for, post_processing_rule.replace_with)
          end

          if args[:emojify]
            content.gsub!(/[^\s]/, '❤️')
          end

          export_data[key.name] = content
        end
      end
      parent_language = parent_language.parent
    end

    if !args[:skip_timestamp]
      export_data['texterify_timestamp'] = Time.now.utc.iso8601
    end

    export_data
  end

  def create_export(project, export_config, file, **args)
    post_processing_rules = project.post_processing_rules.where(export_config_id: [export_config.id, nil]).order_by_name

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

            zip.add(file_path, export_config.file(language, export_data))
            break
          rescue Zip::EntryExistsError
            duplicate_zip_entry_count += 1
          end
        end
    end
  end
end
