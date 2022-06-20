class AddOrganizationIdToForbiddenWordsLists < ActiveRecord::Migration[6.1]
  def change
    change_column :forbidden_words_lists, :project_id, :uuid, null: true

    add_reference :forbidden_words_lists, :organization, type: :uuid, foreign_key: { on_delete: :cascade }
    remove_foreign_key :validation_violations, :validations
  end
end
