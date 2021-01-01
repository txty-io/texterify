FactoryBot.define do
  factory :project do
    sequence :name do |n|
      "Project #{n}"
    end

    organization_id { nil }
  end

  trait :with_organization do
    after(:create) do |project|
      organization = create(:organization)
      project.organization_id = organization.id
      project.save!
    end
  end
end
