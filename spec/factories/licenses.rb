FactoryBot.define do
  factory :license do
    sequence :data do |n|
      key_pair = OpenSSL::PKey::RSA.generate(2048)
      public_key = key_pair.public_key
      Gitlab::License.encryption_key = key_pair
      license = Gitlab::License.new
      license.licensee = {
        'name': 'name',
        'email': 'test@texterify.com'
      }
      license.starts_at = Date.new(2015, 4, 24)
      license.expires_at = Date.new(2016, 4, 23)
      license.restrictions  = {
        active_user_count: 10
      }
      data = license.export
      data
    end
  end
end
