FactoryBot.define do
  factory :organization do
    sequence :name do |n|
      "Organization #{n}"
    end

    trial_ends_at { Time.now.utc + 7 }
  end
end
