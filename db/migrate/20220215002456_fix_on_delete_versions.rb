class FixOnDeleteVersions < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key :versions, :projects
    add_foreign_key :versions, :projects, on_delete: :cascade
  end
end
