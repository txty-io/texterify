class AddHtmlEnabledToKeys < ActiveRecord::Migration[5.2]
  def change
    add_column :keys, :html_enabled, :boolean, default: false, null: false
  end
end
