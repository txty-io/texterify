class AddPluralsToTranslations < ActiveRecord::Migration[6.1]
  def change
    add_column :translations, :zero, :text, null: true
    add_column :translations, :one, :text, null: true
    add_column :translations, :two, :text, null: true
    add_column :translations, :few, :text, null: true
    add_column :translations, :many, :text, null: true
  end
end
