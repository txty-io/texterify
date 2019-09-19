class AddRoleToOrganizationsUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :organizations_users, :role, :string, null: false, default: "translator"
  end
end
