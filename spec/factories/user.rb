FactoryBot.define do
  factory :user do
    sequence :username do |n|
      "User #{n}"
    end
    sequence :email do |n|
      "user-#{n}@example.com"
    end
    password { 'password' }
    password_confirmation { password.to_s }

    factory :user_with_projects do
      transient do
        projects_count { 5 }
      end

      after(:create) do |user, evaluator|
        create_list(:project, evaluator.projects_count, users_project: [user])
      end
    end

    factory :user_with_organizations do
      transient do
        organizations_count { 5 }
      end

      after(:create) do |user, evaluator|
        create_list(:organization, evaluator.organizations_count, users: [user])
      end
    end
  end
end
