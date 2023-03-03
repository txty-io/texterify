class AddErrorMessageToImports < ActiveRecord::Migration[6.1]
  def change
    add_column :imports, :error_message, :text
  end
end
