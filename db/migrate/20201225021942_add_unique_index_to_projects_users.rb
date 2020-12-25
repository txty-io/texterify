class AddUniqueIndexToProjectsUsers < ActiveRecord::Migration[6.0]
  def change
    add_index :projects_users, [:user_id, :project_id], unique: true
  end
end
