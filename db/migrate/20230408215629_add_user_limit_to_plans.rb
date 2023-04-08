class AddUserLimitToPlans < ActiveRecord::Migration[6.1]
  def change
    add_column :plans, :user_limit, :integer
  end
end
