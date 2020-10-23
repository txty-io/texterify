class AddTimestampToReleases < ActiveRecord::Migration[6.0]
  def change
    add_column :releases, :timestamp, :datetime, null: false, default: Time.now.utc.iso8601
    change_column :releases, :timestamp, :datetime, default: nil
  end
end
