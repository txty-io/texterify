class CreateTags < ActiveRecord::Migration[6.1]
  def change
    create_table :tags, id: :uuid do |t|
      t.string :name, null: false
      t.boolean :custom, null: false
      t.references :project, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.index [:name, :custom, :project_id], unique: true
      t.timestamps
    end
  end
end
