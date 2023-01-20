class MakeLanguagePluralsCodeUnique < ActiveRecord::Migration[6.1]
  def change
    add_index :language_plurals, :code, unique: true
  end
end
