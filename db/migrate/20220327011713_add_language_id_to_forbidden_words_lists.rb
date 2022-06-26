class AddLanguageIdToForbiddenWordsLists < ActiveRecord::Migration[6.1]
  def change
    add_reference :forbidden_words_lists, :language, type: :uuid, null: true
    add_foreign_key :forbidden_words_lists, :languages, on_delete: :cascade
  end
end
