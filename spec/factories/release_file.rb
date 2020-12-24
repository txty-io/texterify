FactoryBot.define do
  factory :release_file do
    release_id {}

    sequence :preview_url do |n|
      "http://localhost/preview-url-#{language_code}-#{country_code}-#{n}"
    end

    sequence :url do |n|
      "http://localhost/url-#{language_code}-#{country_code}-#{n}"
    end

    language_code { 'de' }
    country_code { nil }
  end
end
