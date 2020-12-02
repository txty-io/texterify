task create_test_license: [:environment] do
  key = OpenSSL::PKey::RSA.new(File.read('test_license_key'))
  Gitlab::License.encryption_key = key
  data = License.first.license.export
  File.open('texterify.texterify-license', 'w') { |f| f.write(data) }
end
