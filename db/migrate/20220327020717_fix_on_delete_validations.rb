class FixOnDeleteValidations < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key :validations, :organizations
    add_foreign_key :validations, :organizations, on_delete: :cascade
    remove_foreign_key :validations, :projects
    add_foreign_key :validations, :projects, on_delete: :cascade

    remove_foreign_key :validation_violations, :translations
    add_foreign_key :validation_violations, :translations, on_delete: :cascade
    remove_foreign_key :validation_violations, :validations
    add_foreign_key :validation_violations, :validations, on_delete: :cascade
    remove_foreign_key :validation_violations, :projects
    add_foreign_key :validation_violations, :projects, on_delete: :cascade
  end
end
