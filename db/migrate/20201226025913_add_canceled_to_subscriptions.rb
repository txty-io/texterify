class AddCanceledToSubscriptions < ActiveRecord::Migration[6.0]
  def change
    add_column :subscriptions, :canceled, :boolean, null: false, default: false
  end
end
