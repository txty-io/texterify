class AddEnabledToValidations < ActiveRecord::Migration[6.1]
  def change
    add_column :validations, :enabled, :boolean, null: false, default: true
  end
end
