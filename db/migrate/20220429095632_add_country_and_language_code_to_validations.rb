class AddCountryAndLanguageCodeToValidations < ActiveRecord::Migration[6.1]
  def change
    add_reference :validations, :country_code, type: :uuid, foreign_key: { on_delete: :cascade }
    add_reference :validations, :language_code, type: :uuid, foreign_key: { on_delete: :cascade }
  end
end
