require 'csv'

module Txty
  module ExportFormats
    class Csv
      def self.files(export_config, language, export_data, skip_empty_plural_translations: false)
        data = {}
        export_data.each do |key, value|
          if value[:pluralization_enabled]
            if !skip_empty_plural_translations || value[:zero].present?
              data["#{key}.zero"] = { translation: value[:zero], description: value[:description] }
            end
            if !skip_empty_plural_translations || value[:one].present?
              data["#{key}.one"] = { translation: value[:one], description: value[:description] }
            end
            if !skip_empty_plural_translations || value[:two].present?
              data["#{key}.two"] = { translation: value[:two], description: value[:description] }
            end
            if !skip_empty_plural_translations || value[:few].present?
              data["#{key}.few"] = { translation: value[:few], description: value[:description] }
            end
            if !skip_empty_plural_translations || value[:many].present?
              data["#{key}.many"] = { translation: value[:many], description: value[:description] }
            end

            data["#{key}.other"] = { translation: value[:other], description: value[:description] }
          else
            data[key] = { translation: value[:other], description: value[:description] }
          end
        end

        content =
          CSV.generate(quote_empty: false) do |csv|
            data.each { |key, value| csv << [key, value[:description], value[:translation]] }
          end

        language_file = Tempfile.new(language.id.to_s)
        language_file.puts(content)
        language_file.close

        [{ path: Txty::ExportFormats::Helpers.filled_file_path(export_config, language), file: language_file }]
      end
    end
  end
end
