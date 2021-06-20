class ChangeDeeplLanguagesUniqueIndex < ActiveRecord::Migration[6.1]
  def change
    remove_index :deepl_source_languages, :language_code
    add_index :deepl_source_languages, [:language_code, :country_code], unique: true

    remove_index :deepl_target_languages, :language_code
    add_index :deepl_target_languages, [:language_code, :country_code], unique: true
  end
end
