class AddCountryCodeIdToLanguage < ActiveRecord::Migration[5.1]
  def change
    add_reference :languages, :country_code, type: :uuid, foreign_key: true
  end
end
