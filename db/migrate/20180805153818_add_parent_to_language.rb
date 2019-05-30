class AddParentToLanguage < ActiveRecord::Migration[5.1]
  def change
    add_reference :languages, :parent, type: :uuid
    add_foreign_key :languages, :languages, column: :parent_id
  end
end
