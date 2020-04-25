class CreateOrganizationsUsers < ActiveRecord::Migration[5.2]
  def change
    create_join_table :users, :organizations, id: :uuid, column_options: { type: :uuid, foreign_key: true } do |t|
      t.timestamps null: false
      t.index [:user_id]
      t.index [:organization_id]
    end
  end
end
