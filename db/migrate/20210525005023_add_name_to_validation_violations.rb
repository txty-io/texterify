class AddNameToValidationViolations < ActiveRecord::Migration[6.1]
  def change
    add_column :validation_violations, :name, :string
    change_column :validation_violations, :validation_id, :uuid, null: true
    add_reference :validation_violations, :translation, type: :uuid, foreign_key: true
    add_index :validation_violations, [:name, :project_id, :translation_id, :validation_id], unique: true, name: "index_validation_violations_uniqueness"
  end
end
