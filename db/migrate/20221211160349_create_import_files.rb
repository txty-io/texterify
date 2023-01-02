class CreateImportFiles < ActiveRecord::Migration[6.1]
  def change
    create_table :import_files, id: :uuid do |t|
      t.text :name, null: false
      t.text :status, null: false
      t.text :status_message
      t.text :error_message

      t.timestamps
    end

    add_reference :import_files, :import, type: :uuid, null: false
    add_foreign_key :import_files, :imports, on_delete: :cascade

    add_reference :import_files, :language, type: :uuid, null: true
    add_foreign_key :import_files, :languages, on_delete: :nullify
  end
end
