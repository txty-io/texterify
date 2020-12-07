class UserLicenseSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :data

  attribute :licensee do |user_license|
    user_license.license.licensee
  end

  attribute :starts_at do |user_license|
    user_license.license.starts_at
  end

  attribute :expires_at do |user_license|
    user_license.license.expires_at
  end

  attribute :restrictions do |user_license|
    user_license.license.restrictions
  end
end
