class CreateUsersProjects < ActiveRecord::Migration[5.1]
  def change
    create_join_table :users, :projects, id: :uuid do |t|
      t.references :user, index: true, null: false, type: :uuid, foreign_key: true
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
