class ChangeShowColumns < ActiveRecord::Migration[5.1]
  def change
    change_column :project_columns, :show_name, :boolean, null: false, default: true
    change_column :project_columns, :show_description, :boolean, null: false, default: true
  end
end
