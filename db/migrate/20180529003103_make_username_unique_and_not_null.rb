class MakeUsernameUniqueAndNotNull < ActiveRecord::Migration[5.1]
  def change
    add_index :users, :username
    change_column :users, :username, :string, null: false, unique: true
  end
end
