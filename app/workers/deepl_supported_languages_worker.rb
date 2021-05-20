require 'sidekiq-scheduler'

# Loads the supported languages of DeepL.
# https://www.deepl.com/docs-api/other-functions/listing-supported-languages/
class DeeplSupportedLanguagesWorker
  include Sidekiq::Worker

  def perform(*_args)
    if ENV['DEEPL_API_TOKEN']
      deepl_client = ::Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])

      source_languages = deepl_client.source_languages
      source_languages.each do |source_language|
        DeeplSourceLanguage.where(name: source_language['name']).first_or_create do |item|
          item.language = source_language['language']
        end
      end

      target_languages = deepl_client.target_languages
      target_languages.each do |target_language|
        DeeplTargetLanguage.where(name: target_language['name']).first_or_create do |item|
          item.language = target_language['language']
        end
      end
    end
  end
end
