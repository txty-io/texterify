class AddKeysLimitToOrganizations < ActiveRecord::Migration[6.1]
  def change
    add_column :organizations, :keys_limit, :integer, default: 0, null: false
  end
end
