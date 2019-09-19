class AddRoleToProjectsUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :projects_users, :role, :string, null: false, default: "translator"
  end
end
