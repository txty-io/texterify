class UserLicense < ApplicationRecord
  belongs_to :user

  validates :data, presence: true

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
end
