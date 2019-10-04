class AddIsDefaultToLanguages < ActiveRecord::Migration[5.2]
  def change
    add_column :languages, :is_default, :boolean, default: false, null: false
  end
end
