class CreateFileFormats < ActiveRecord::Migration[6.1]
  def change
    create_table :file_formats, id: :uuid do |t|
      t.text :format, null: false

      t.timestamps
    end

    add_reference :import_files, :file_format, type: :uuid, null: true
    add_foreign_key :import_files, :file_formats, on_delete: :nullify
  end
end
