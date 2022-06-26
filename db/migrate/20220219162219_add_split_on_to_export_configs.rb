class AddSplitOnToExportConfigs < ActiveRecord::Migration[6.1]
  def change
    add_column :export_configs, :split_on, :string
  end
end
