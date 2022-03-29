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

      # Set fixed ID for snapshots.
      organization.id = '194c811a-fb3c-4063-8ce1-cfb9191e7afa'
      organization.save!

      project.organization_id = organization.id

      # Set fixed ID for snapshots.
      project.id = '3341caa7-d261-4a5e-a76e-eb71470f8042'
      project.save!
    end
  end
end
