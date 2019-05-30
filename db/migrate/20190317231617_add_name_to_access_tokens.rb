class AddNameToAccessTokens < ActiveRecord::Migration[5.1]
  def change
    add_column :access_tokens, :name, :string
  end
end
