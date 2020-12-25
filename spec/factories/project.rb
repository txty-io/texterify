FactoryBot.define do
  factory :project do
    sequence :name do |n|
      "Project #{n}"
    end

    organization_id { nil }
  end
end
