class MakeAccessTokenNameNotNull < ActiveRecord::Migration[5.1]
  def change
    change_column :access_tokens, :name, :string, null: false
  end
end
