class MakeLanguageNameNotNull < ActiveRecord::Migration[6.0]
  def change
    change_column :languages, :name, :string, null: false
  end
end
