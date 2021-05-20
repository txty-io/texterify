class CreateDeeplSourceLanguages < ActiveRecord::Migration[6.1]
  def change
    create_table :deepl_source_languages, id: :uuid do |t|
      t.text :language, null: false
      t.text :name, null: false
      t.index %i[ language ], unique: true
      t.timestamps
    end
  end
end
