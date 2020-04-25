class CreateUsersProjects < ActiveRecord::Migration[5.1]
  def change
    create_join_table :users, :projects, id: :uuid, column_options: { type: :uuid, foreign_key: true } do |t|
      t.timestamps null: false
      t.index [:user_id]
      t.index [:project_id]
    end
  end
end
