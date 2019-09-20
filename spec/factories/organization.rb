FactoryBot.define do
  factory :organization do
    sequence :name do |n|
      "Organization #{n}"
    end
  end
end
