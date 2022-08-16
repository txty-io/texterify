task create_test_license_team: [:environment] do
    key = OpenSSL::PKey::RSA.new(File.read('test_license_key'))
    Gitlab::License.encryption_key = key

    license = Gitlab::License.new
    license.licensee = {
        name: 'Test License User Team',
        email: 'test-license-user-team@texterify.com',
        company: 'Test License Company Team'
    }
    license.starts_at = DateTime.now
    license.expires_at = DateTime.now + 12.months
    license.restrictions = { plan: 'team', active_users_count: 3 }
    data = license.export

    File.write('test_team.texterify-license', data)
end
