class AddFileFormatToExportConfigs < ActiveRecord::Migration[5.2]
  def change
    add_column :export_configs, :file_format, :string, null: false
  end
end
