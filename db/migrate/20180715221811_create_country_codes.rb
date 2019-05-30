class CreateCountryCodes < ActiveRecord::Migration[5.1]
  def change
    create_table :country_codes, id: :uuid do |t|
      t.string :name, null: false
      t.string :code, null: false, index: true
      t.timestamps null: false
    end
  end
end
