class RemoveKeysLimitFromOrganizations < ActiveRecord::Migration[6.1]
  def change
    remove_column :organizations, :keys_limit
  end
end
