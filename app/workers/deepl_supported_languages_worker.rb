require 'sidekiq-scheduler'
require 'deepl'

# Loads the supported languages of DeepL.
# https://www.deepl.com/docs-api/other-functions/listing-supported-languages/
class DeeplSupportedLanguagesWorker
  include Sidekiq::Worker

  def perform(*_args)
    if ENV.fetch('DEEPL_API_TOKEN', nil)
      deepl_client = Deepl::Client.new

      source_languages = deepl_client.source_languages
      source_languages&.each do |source_language|
        language_code = nil
        country_code = nil

        if source_language['language'].include?('-')
          splitted = source_language['language'].split('-')
          language_code = splitted[0].downcase
          country_code = splitted[1]
        else
          language_code = source_language['language'].downcase
        end

        deepl_source_language = DeeplSourceLanguage.find_by(language_code: language_code, country_code: country_code)

        unless deepl_source_language
          DeeplSourceLanguage.create!(
            language_code: language_code,
            country_code: country_code,
            name: source_language['name']
          )
        end
      end

      target_languages = deepl_client.target_languages
      target_languages&.each do |target_language|
        language_code = nil
        country_code = nil

        if target_language['language'].include?('-')
          splitted = target_language['language'].split('-')
          language_code = splitted[0].downcase
          country_code = splitted[1]
        else
          language_code = target_language['language'].downcase
        end

        deepl_target_language = DeeplTargetLanguage.find_by(language_code: language_code, country_code: country_code)

        unless deepl_target_language
          DeeplTargetLanguage.create!(
            language_code: language_code,
            country_code: country_code,
            name: target_language['name']
          )
        end
      end
    end
  end
end
