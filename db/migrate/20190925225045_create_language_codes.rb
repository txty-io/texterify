class CreateLanguageCodes < ActiveRecord::Migration[5.2]
  def change
    create_table :language_codes, id: :uuid do |t|
      t.string :name, null: false
      t.string :code, null: false, index: true
      t.timestamps null: false
    end
  end
end
