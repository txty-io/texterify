FactoryBot.define do
  factory :project do
    sequence :name do |n|
      "Project #{n}"
    end

    organization_id { nil }
  end

  trait :with_organization do
    before(:create) do |project|
      organization = create(:organization)

      project.organization_id = organization.id
    end
  end

  trait :with_business_plan do
    after(:create) do |project|
      organization = project.organization
      custom_subscription = CustomSubscription.new
      custom_subscription.provider = 'for-testing'
      custom_subscription.plan = 'business'
      custom_subscription.redeemable_by_email = 'for-testing'
      custom_subscription.organization_id = organization.id
      custom_subscription.save!
    end
  end

  trait :with_default_language_keys_and_translations do
    after(:create) do |project|
      language_code_en = LanguageCode.find_by(code: 'en')

      language = Language.new
      language.name = 'English'
      language.project_id = project.id
      language.is_default = true
      language.language_code_id = language_code_en.id
      language.save!

      key1 = create(:key, project_id: project.id)
      key2 = create(:key, project_id: project.id)
      key3 = create(:key, project_id: project.id)
      key4 = create(:key, project_id: project.id)

      create(:translation, language_id: language.id, key_id: key1.id)
      create(:translation, language_id: language.id, key_id: key2.id)
      create(:translation, language_id: language.id, key_id: key3.id)
      create(:translation, language_id: language.id, key_id: key4.id)
    end
  end
end
