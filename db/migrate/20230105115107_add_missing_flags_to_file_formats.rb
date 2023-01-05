class AddMissingFlagsToFileFormats < ActiveRecord::Migration[6.1]
  def change
    add_column :file_formats, :import_support, :boolean, default: false, null: false
    add_column :file_formats, :export_support, :boolean, default: false, null: false
    add_column :file_formats, :plural_support, :boolean, default: false, null: false
    add_column :file_formats, :skip_empty_plural_translations_support, :boolean, default: false, null: false
    add_index :file_formats, [:format], unique: true
  end
end
