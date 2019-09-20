class MakeUsernameIndexUnique < ActiveRecord::Migration[5.2]
  def change
    remove_index :users, :username
    add_index :users, :username, unique: true
  end
end
