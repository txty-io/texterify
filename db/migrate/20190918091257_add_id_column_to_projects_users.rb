class AddIdColumnToProjectsUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :projects_users, :id, :uuid, primary_key: true, default: "gen_random_uuid()"
  end
end
