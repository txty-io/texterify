class AddPlaceholderFieldsToProject < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :placeholder_start, :string, null: true
    add_column :projects, :placeholder_end, :string, null: true
  end
end
