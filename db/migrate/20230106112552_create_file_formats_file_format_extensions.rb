class CreateFileFormatsFileFormatExtensions < ActiveRecord::Migration[6.1]
  def change
    create_join_table :file_formats,
                      :file_format_extensions,
                      table_name: :file_formats_file_format_extensions,
                      id: :uuid,
                      column_options: {
                        type: :uuid,
                        foreign_key: {
                          on_delete: :cascade
                        }
                      } do |t|
      t.timestamps null: false
      t.index [:file_format_id], name: 'index_file_format_extensions_join_table_format_id'
      t.index [:file_format_extension_id], name: 'index_file_format_extensions_join_table_format_extension_id'
    end

    add_column :file_formats_file_format_extensions, :id, :uuid, primary_key: true, default: 'gen_random_uuid()'
    add_index :file_formats_file_format_extensions,
              [:file_format_id, :file_format_extension_id],
              unique: true,
              name: 'index_file_format_extensions_join_table_unique'
  end
end
