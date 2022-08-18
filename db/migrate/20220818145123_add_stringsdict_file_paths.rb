class AddStringsdictFilePaths < ActiveRecord::Migration[6.1]
  def change
    add_column :export_configs, :file_path_stringsdict, :string
    add_column :export_configs, :default_language_file_path_stringsdict, :string
  end
end
