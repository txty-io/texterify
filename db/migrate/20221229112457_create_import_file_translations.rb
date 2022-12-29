class CreateImportFileTranslations < ActiveRecord::Migration[6.1]
  def change
    create_table :import_file_translations, id: :uuid do |t|
      t.text :key_name, null: false
      t.text :key_description
      t.text :other
      t.text :zero
      t.text :one
      t.text :two
      t.text :few
      t.text :many

      t.timestamps
    end

    add_reference :import_file_translations, :import_file, type: :uuid, null: false
    add_foreign_key :import_file_translations, :import_files, on_delete: :cascade
  end
end
