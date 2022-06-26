class AddCountryAndLanguageCodeToForbiddenWordsLists < ActiveRecord::Migration[6.1]
  def change
    add_reference :forbidden_words_lists, :country_code, type: :uuid, foreign_key: { on_delete: :cascade }
    add_reference :forbidden_words_lists, :language_code, type: :uuid, foreign_key: { on_delete: :cascade }
  end
end
