FactoryBot.define do
  factory :post_processing_rule do
    sequence :name do |n|
      "Rule #{n}"
    end
  end
end
