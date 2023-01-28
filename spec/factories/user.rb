FactoryBot.define do
  factory :user do
    sequence :username do |n|
      "Test User #{n}"
    end
    sequence :email do |n|
      "test-user-#{n}@texterify.com"
    end
    password { 'password' }
    password_confirmation { password.to_s }

    factory :user_with_projects do
      transient { projects_count { 5 } }

      after(:create) do |user, evaluator|
        create_list(:project, evaluator.projects_count, users_project: [user], organization: create(:organization))
      end
    end

    factory :user_with_organizations do
      transient { organizations_count { 5 } }

      after(:create) { |user, evaluator| create_list(:organization, evaluator.organizations_count, users: [user]) }
    end
  end
end
