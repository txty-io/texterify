class AddNewColumnsToProjectColumns < ActiveRecord::Migration[6.0]
  def change
    add_column :project_columns, :show_tags, :boolean, null: false, default: true
    add_column :project_columns, :show_overwrites, :boolean, null: false, default: true
  end
end
