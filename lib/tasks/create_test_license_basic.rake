task create_test_license_basic: [:environment] do
    key = OpenSSL::PKey::RSA.new(File.read('test_license_key'))
    Gitlab::License.encryption_key = key

    license = Gitlab::License.new
    license.licensee = {
        name: 'Test License User Basic',
        email: 'test-license-user-basic@example.com',
        company: 'Test License Company Basic'
    }
    license.starts_at = DateTime.now
    license.expires_at = DateTime.now + 12.months
    license.restrictions = { plan: 'basic', active_users_count: 3 }
    data = license.export

    File.write('test_basic.txty-license', data)
end
