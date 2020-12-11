class AddPlanToSubscriptions < ActiveRecord::Migration[6.0]
  def change
    add_column :subscriptions, :plan, :string, null: false
  end
end
