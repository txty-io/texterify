FactoryBot.define do
  factory :translation do
    sequence :content do |n|
      "Translation #{n}"
    end

    language_id { language_id }
    key_id { key_id }
  end
end
