class AddUniqueConstraintCountryLanguageCodes < ActiveRecord::Migration[6.0]
  def change
    add_index :country_codes, [:name, :code], unique: true
    add_index :language_codes, [:name, :code], unique: true
  end
end
