class AddDisabledToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :disabled, :boolean, default: false, null: false
  end
end
