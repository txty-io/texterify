class CreateLanguagePlurals < ActiveRecord::Migration[6.1]
  def change
    create_table :language_plurals, id: :uuid do |t|
      t.string :code, null: false

      t.boolean :supports_plural_zero, null: false
      t.boolean :supports_plural_one, null: false
      t.boolean :supports_plural_two, null: false
      t.boolean :supports_plural_few, null: false
      t.boolean :supports_plural_many, null: false

      t.timestamps
    end
  end
end
