class AddSupportedPluralFormsToLanguages < ActiveRecord::Migration[6.1]
  def change
    add_column :languages, :supports_plural_zero, :boolean, null: false, default: true
    add_column :languages, :supports_plural_one, :boolean, null: false, default: true
    add_column :languages, :supports_plural_two, :boolean, null: false, default: true
    add_column :languages, :supports_plural_few, :boolean, null: false, default: true
    add_column :languages, :supports_plural_many, :boolean, null: false, default: true
  end
end
