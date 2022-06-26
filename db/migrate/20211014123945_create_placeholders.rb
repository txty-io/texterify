class CreatePlaceholders < ActiveRecord::Migration[6.1]
  def change
    create_table :placeholders, id: :uuid do |t|
      t.string :name, null: false
      t.string :description, null: true
      t.references :key, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.index [:name, :key_id], unique: true
      t.timestamps
    end
  end
end
