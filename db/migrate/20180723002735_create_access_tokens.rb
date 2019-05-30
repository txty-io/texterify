class CreateAccessTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :access_tokens, id: :uuid do |t|
      t.string :secret, null: false
      t.references :user, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
