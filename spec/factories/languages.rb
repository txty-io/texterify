FactoryBot.define do
  factory :language do
    sequence :name do |n|
      "language_#{n}"
    end

    project_id { project_id }
  end
end
