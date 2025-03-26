class AddTimeStampFlagToExportConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :export_configs, :export_timestamp, :boolean, default: true
  end
end
