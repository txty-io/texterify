class CreateFileFormatExtensions < ActiveRecord::Migration[6.1]
  def change
    create_table :file_format_extensions, id: :uuid do |t|
      t.text :extension, null: false

      t.timestamps
    end

    add_index :file_format_extensions, [:extension], unique: true, name: 'index_file_format_extensions_unique'
  end
end
