class AddUniqueIndexToOrganizationsUsers < ActiveRecord::Migration[6.0]
  def change
    add_index :organizations_users, [:user_id, :organization_id], unique: true
  end
end
