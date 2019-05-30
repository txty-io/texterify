class CreateTranslations < ActiveRecord::Migration[5.1]
  def change
    create_table :translations, id: :uuid do |t|
      t.text :content
      t.references :key, index: true, null: false, type: :uuid, foreign_key: true
      t.references :language, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
