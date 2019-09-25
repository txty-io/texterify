class AddLanguageCodeIdToLanguage < ActiveRecord::Migration[5.2]
  def change
    add_reference :languages, :language_code, type: :uuid, foreign_key: true
  end
end
