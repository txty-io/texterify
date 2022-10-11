FactoryBot.define do
  factory :flavor do
    sequence :name do |n|
      "Flavor #{n}"
    end
    project_id { nil }
  end
end
