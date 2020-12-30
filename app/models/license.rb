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
    return unless data

    @license ||=
      begin
        Gitlab::License.import(data)
      rescue Gitlab::License::ImportError
        nil
      end
  end
end
