if Rails.env.production?
  public_key = OpenSSL::PKey::RSA.new(File.read('license_key.pub'))
else
  public_key = OpenSSL::PKey::RSA.new(File.read('test_license_key.pub'))
end

Gitlab::License.encryption_key = public_key
