class CreateWordpressPolylangConnections < ActiveRecord::Migration[6.1]
  def change
    create_table :wordpress_polylang_connections, id: :uuid do |t|
      t.string :wordpress_url
      t.string :auth_user
      t.string :auth_password

      t.references :project,
                   index: true,
                   unique: true,
                   null: false,
                   type: :uuid,
                   foreign_key: {
                     on_delete: :cascade
                   }

      t.timestamps
    end
  end
end
