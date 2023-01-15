module Texterify
  module ExportFormats
    class Helpers
      def self.export_data_value(text, pluralization_enabled: false, empty_plurals: false)
        {
          other: text,
          zero: empty_plurals ? '' : 'zero text',
          one: empty_plurals ? '' : 'one text',
          two: empty_plurals ? '' : 'two text',
          few: empty_plurals ? '' : 'few text',
          many: empty_plurals ? '' : 'many text',
          pluralization_enabled: pluralization_enabled,
          description: 'description text'
        }
      end

      def self.filled_file_path(export_config, language, path_for: nil)
        path_to_use = export_config.file_path
        path_to_use_default_langage = export_config.default_language_file_path

        if path_for == 'stringsdict'
          if export_config.file_path_stringsdict
            path_to_use = export_config.file_path_stringsdict
          end

          if export_config.default_language_file_path_stringsdict
            path_to_use_default_langage = export_config.default_language_file_path_stringsdict
          end
        end

        path = path_to_use

        if language.is_default && path_to_use_default_langage.present?
          path = path_to_use_default_langage
        end

        language_config_code = export_config.language_configs.find_by(language_id: language.id)

        # Use the language code from the language config if available.
        if language_config_code
          path = path.sub('{languageCode}', language_config_code.language_code)
        elsif language.language_code
          path = path.sub('{languageCode}', language.language_code.code)
        else
          path
        end

        language.country_code ? path.sub('{countryCode}', language.country_code.code) : path
      end
    end
  end
end
