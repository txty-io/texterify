class AddUsersCountToSubscriptions < ActiveRecord::Migration[6.0]
  def change
    add_column :subscriptions, :users_count, :integer, null: false, default: 1
  end
end
