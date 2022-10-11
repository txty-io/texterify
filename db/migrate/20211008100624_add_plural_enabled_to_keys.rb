class AddPluralEnabledToKeys < ActiveRecord::Migration[6.1]
  def change
    add_column :keys, :pluralization_enabled, :boolean, null: false, default: false
  end
end
