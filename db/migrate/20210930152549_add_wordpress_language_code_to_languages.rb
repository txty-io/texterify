class AddWordpressLanguageCodeToLanguages < ActiveRecord::Migration[6.1]
  def change
    add_column :languages, :wordpress_language_code, :string, null: true
  end
end
