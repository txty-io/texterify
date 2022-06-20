class AddWordpressLanguageIdToLanguages < ActiveRecord::Migration[6.1]
  def change
    add_column :languages, :wordpress_language_id, :string, null: true
  end
end
