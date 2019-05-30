class CreateLanguages < ActiveRecord::Migration[5.1]
  def change
    create_table :languages, id: :uuid do |t|
      t.string :name
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
