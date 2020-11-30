public_key = OpenSSL::PKey::RSA.new(File.read('license_key.pub')) if Rails.env.production?
public_key = OpenSSL::PKey::RSA.new(File.read('test_license_key.pub')) if !Rails.env.production?
Gitlab::License.encryption_key = public_key
