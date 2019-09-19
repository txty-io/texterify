class AddIdColumnToOrganizationsUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :organizations_users, :id, :uuid, primary_key: true, default: "gen_random_uuid()"
  end
end
