class CreateValidations < ActiveRecord::Migration[6.1]
  def change
    create_table :validations, id: :uuid do |t|
      t.text :name, null: false
      t.text :description, null: true
      t.text :match, null: false
      t.text :content, null: false
      t.references :organization, index: true, null: true, type: :uuid, foreign_key: true, on_delete: :cascade
      t.references :project, index: true, null: true, type: :uuid, foreign_key: true, on_delete: :cascade
      t.timestamps
    end

    create_table :validation_violations, id: :uuid do |t|
      t.boolean :ignored, null: false, default: false
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true, on_delete: :cascade
      t.references :validation, index: true, null: false, type: :uuid, foreign_key: true, on_delete: :cascade
      t.timestamps
    end
  end
end
