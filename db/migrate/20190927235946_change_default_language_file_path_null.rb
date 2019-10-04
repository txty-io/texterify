class ChangeDefaultLanguageFilePathNull < ActiveRecord::Migration[5.2]
  def change
    change_column :export_configs, :default_language_file_path, :string, null: true
  end
end
