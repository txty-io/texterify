class AddCountryCodeToDeeplTables < ActiveRecord::Migration[6.1]
  def change
    add_column :deepl_source_languages, :country_code, :text
    add_column :deepl_target_languages, :country_code, :text

    rename_column :deepl_source_languages, :language, :language_code
    rename_column :deepl_target_languages, :language, :language_code
  end
end
