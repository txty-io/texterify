class License < ApplicationRecord
  validates :data, presence: true

  # Sets the data from a file.
  def data_file=(file)
    self.data = file.read
  end

  def reset_license
    @license = nil
  end

  def license
    unless data
      return
    end

    @license ||=
      begin
        Gitlab::License.import(data)
      rescue Gitlab::License::ImportError
        nil
      end
  end

  class << self
    def current_active
      license = License.order(created_at: :desc).first
      if license && license.license.expires_at > Time.now.utc
        license.license
      end
    end
  end
end
