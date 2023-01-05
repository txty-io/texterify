class AddNameToFileFormats < ActiveRecord::Migration[6.1]
  def change
    add_column :file_formats, :name, :text, default: '', null: false
  end
end
