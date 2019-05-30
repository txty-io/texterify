class MakeLanguageCaseInsensitiveUnique < ActiveRecord::Migration[5.1]
  def change
    enable_extension :citext
    change_column :languages, :name, :citext
    add_index :languages, :name, unique: true
  end
end
