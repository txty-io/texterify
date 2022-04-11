class AddForbiddenWordIdToValidationViolations < ActiveRecord::Migration[6.1]
  def change
    add_reference :validation_violations, :forbidden_word, type: :uuid, null: true
    add_foreign_key :validation_violations, :forbidden_words, on_delete: :cascade
  end
end
