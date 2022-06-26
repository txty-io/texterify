class MakeFwlNameNotNull < ActiveRecord::Migration[6.1]
  def change
    change_column :forbidden_words_lists, :name, :string, null: false
  end
end
