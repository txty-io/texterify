class CreatePermissions < ActiveRecord::Migration[5.1]
  def change
    create_table :permissions, id: :uuid do |t|
      t.string :permission, null: false
      t.references :user, index: true, null: false, type: :uuid, foreign_key: true
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
