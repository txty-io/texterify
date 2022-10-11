FactoryBot.define do
  factory :tag do
    sequence :name do |n|
      "tag_#{n}"
    end

    project_id { project_id }
    custom { false }
  end
end
