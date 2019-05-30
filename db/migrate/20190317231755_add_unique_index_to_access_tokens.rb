class AddUniqueIndexToAccessTokens < ActiveRecord::Migration[5.1]
  def change
    add_index :access_tokens, [:user_id, :name], unique: true
  end
end
