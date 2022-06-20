class AddDeactivatedToOrganizationUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :organizations_users, :deactivated, :boolean, null: false, default: false
    add_column :organizations_users, :deactivated_reason, :text
    add_column :projects_users, :deactivated, :boolean, null: false, default: false
    add_column :projects_users, :deactivated_reason, :text
    add_column :users, :deactivated, :boolean, null: false, default: false
    add_column :users, :deactivated_reason, :text
  end
end
