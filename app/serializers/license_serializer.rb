class LicenseSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :data

  attribute :licensee do |license|
    license.license&.licensee
  end

  attribute :starts_at do |license|
    license.license&.starts_at
  end

  attribute :expires_at do |license|
    license.license&.expires_at
  end

  attribute :expired do |license|
    license.license&.expires_at ? license.license.expires_at < Time.now.utc : false
  end

  attribute :restrictions do |license|
    license.license&.restrictions
  end
end
