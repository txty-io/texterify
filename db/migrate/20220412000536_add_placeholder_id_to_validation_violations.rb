class AddPlaceholderIdToValidationViolations < ActiveRecord::Migration[6.1]
  def change
    add_reference :validation_violations, :placeholder, type: :uuid, null: true
    add_foreign_key :validation_violations, :placeholders, on_delete: :cascade
  end
end
