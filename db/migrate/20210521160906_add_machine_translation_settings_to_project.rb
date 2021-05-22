class AddMachineTranslationSettingsToProject < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :machine_translation_enabled, :boolean, null: false, default: true
    add_column :projects, :auto_translate_new_keys, :boolean, null: false, default: false
    add_column :projects, :auto_translate_new_languages, :boolean, null: false, default: false
  end
end
