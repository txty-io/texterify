class MakeProjectsUserIdNullable < ActiveRecord::Migration[5.2]
  def change
    change_column :projects, :user_id, :uuid, null: true
  end
end
