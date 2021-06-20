class AddMachineTranslationLimitsToProjectAndOrganization < ActiveRecord::Migration[6.1]
  def change
    add_column :organizations, :machine_translation_character_usage, :integer, null: false, default: 0
    add_column :projects, :machine_translation_character_usage, :integer, null: false, default: 0
    add_column :organizations, :machine_translation_character_limit, :integer, default: 10000
  end
end
