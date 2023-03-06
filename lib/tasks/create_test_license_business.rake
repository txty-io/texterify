task create_test_license_business: [:environment] do
    key = OpenSSL::PKey::RSA.new(File.read('test_license_key'))
    Gitlab::License.encryption_key = key

    license = Gitlab::License.new
    license.licensee = {
        name: 'Test License User Business',
        email: 'test-license-user-business@example.com',
        company: 'Test License Company Business'
    }
    license.starts_at = DateTime.now
    license.expires_at = DateTime.now + 12.months
    license.restrictions = { plan: 'business', active_users_count: 3 }
    data = license.export

    File.write('test_business.txty-license', data)
end
