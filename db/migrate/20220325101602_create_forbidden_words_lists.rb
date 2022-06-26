class CreateForbiddenWordsLists < ActiveRecord::Migration[6.1]
  def change
    create_table :forbidden_words_lists, id: :uuid do |t|
      t.string :name
      t.string :content

      t.references :project, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.timestamps
    end
  end
end
