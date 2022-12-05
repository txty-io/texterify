class CreateImports < ActiveRecord::Migration[6.1]
  def change
    create_table :imports, id: :uuid do |t|
      t.string :name, null: false
      t.string :status, null: false

      t.timestamps
    end

    add_reference :imports, :project, type: :uuid, null: false
    add_foreign_key :imports, :projects, on_delete: :cascade

    add_reference :imports, :user, type: :uuid, null: true
    add_foreign_key :imports, :users, on_delete: :nullify
  end
end
