class CreateForbiddenWords < ActiveRecord::Migration[6.1]
  def change
    create_table :forbidden_words, id: :uuid do |t|
      t.string :content

      t.references :forbidden_words_list, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.timestamps
    end
  end
end
