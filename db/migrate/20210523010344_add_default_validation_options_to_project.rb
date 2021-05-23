class AddDefaultValidationOptionsToProject < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :validate_leading_whitespace, :boolean, null: false, default: true
    add_column :projects, :validate_trailing_whitespace, :boolean, null: false, default: true
    add_column :projects, :validate_double_whitespace, :boolean, null: false, default: true
    add_column :projects, :validate_https, :boolean, null: false, default: true
  end
end
