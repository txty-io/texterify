class AddSkipEmptyPluralTranslationsToExportConfigs < ActiveRecord::Migration[6.1]
  def change
    add_column :export_configs, :skip_empty_plural_translations, :boolean, default: false, null: false
  end
end
