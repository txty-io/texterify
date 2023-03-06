FactoryBot.define do
  factory :license do
    sequence :data do |n|
      private_key = OpenSSL::PKey::RSA.new(File.read('test_license_key'))
      Gitlab::License.encryption_key = private_key
      license = Gitlab::License.new
      license.licensee = { 'name': "Name #{n}", 'email': "test#{n}@example.com" }
      license.starts_at = Date.new(2015, 4, 24)
      license.expires_at = Date.new(2016, 4, 23)
      license.restrictions = { active_users_count: 10 }
      data = license.export
      data
    end
  end
end
