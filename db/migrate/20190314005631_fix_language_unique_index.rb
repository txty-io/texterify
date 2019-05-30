class FixLanguageUniqueIndex < ActiveRecord::Migration[5.1]
  def change
    remove_index :languages, name: "index_languages_on_name"
    add_index :languages, [:project_id, :name], unique: true
  end
end
