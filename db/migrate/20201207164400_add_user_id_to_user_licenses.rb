class AddUserIdToUserLicenses < ActiveRecord::Migration[6.0]
  def change
    add_reference :user_licenses, :user, type: :uuid, foreign_key: true
  end
end
