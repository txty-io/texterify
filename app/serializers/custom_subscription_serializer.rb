class CustomSubscriptionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id,
             :plan,
             :provider,
             :provider_plan,
             :provider_license_key,
             :max_users,
             :machine_translation_character_limit,
             :ends_at
end
