class AddDeeplApiTokenType < ActiveRecord::Migration[6.1]
  def change
    add_column :organizations, :deepl_api_token_type, :string
  end
end
