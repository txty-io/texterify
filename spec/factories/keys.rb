FactoryBot.define do
  factory :key do
    sequence :name do |n|
      "key_#{n}"
    end

    project_id { project_id }
  end
end
