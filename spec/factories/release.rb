FactoryBot.define do
  factory :release do
    transient { locales { [] } }

    sequence :version do |n|
      n
    end

    timestamp { Time.now.utc.iso8601 }
    export_config_id { nil }

    after(:create) do |release, evaluator|
      evaluator.locales.each do |locale|
        create(
          :release_file,
          language_code: locale[:language_code],
          country_code: locale[:country_code],
          release_id: release.id
        )
      end
    end
  end
end
