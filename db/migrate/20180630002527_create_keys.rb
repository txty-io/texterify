class CreateKeys < ActiveRecord::Migration[5.1]
  def change
    create_table :keys, id: :uuid do |t|
      t.string :name, null: false
      t.string :description
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
