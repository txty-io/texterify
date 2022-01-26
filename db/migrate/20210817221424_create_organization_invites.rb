class CreateOrganizationInvites < ActiveRecord::Migration[6.1]
  def change
    create_table :organization_invites, id: :uuid do |t|
      t.string :email, null: false, unique: true
      t.string :role, null: false, unique: true, default: 'translator'
      t.references :organization,
                   index: true,
                   null: true,
                   type: :uuid,
                   foreign_key: {
                     on_delete: :cascade
                   }
      t.index %i[email organization_id], unique: true
      t.timestamps
    end
  end
end
