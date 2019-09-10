class CreateOrganizationsUsers < ActiveRecord::Migration[5.2]
  def change
    create_join_table :users, :organizations, id: :uuid do |t|
      t.references :user, index: true, null: false, type: :uuid, foreign_key: true
      t.references :organization, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
