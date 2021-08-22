class AddOpenFlagToToInvites < ActiveRecord::Migration[6.1]
  def change
    add_column :organization_invites, :open, :boolean, null: false, default: true
    remove_index :organization_invites, %i[email organization_id]
    add_index :organization_invites, %i[email organization_id open], unique: true, name: "index_organization_invites_unique"
  end
end
