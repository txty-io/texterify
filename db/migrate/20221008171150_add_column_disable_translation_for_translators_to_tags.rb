class AddColumnDisableTranslationForTranslatorsToTags < ActiveRecord::Migration[6.1]
  def change
    add_column :tags, :disable_translation_for_translators, :boolean, null: false, default: false
  end
end
