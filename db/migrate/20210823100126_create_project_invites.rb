class CreateProjectInvites < ActiveRecord::Migration[6.1]
  def change
    create_table :project_invites, id: :uuid do |t|
      t.string :email, null: false, unique: true
      t.string :role, null: false, unique: true, default: 'translator'
      t.boolean :open, null: false, default: true
      t.references :project,
                   index: true,
                   null: true,
                   type: :uuid,
                   foreign_key: true,
                   foreign_key: {
                     on_delete: :cascade
                   }
      t.index %i[email project_id open], unique: true
      t.timestamps
    end
  end
end
