class CreatePlans < ActiveRecord::Migration[6.1]
  def change
    create_table :plans, id: :uuid do |t|
      t.text :name, null: false
      t.integer :keys_limit
      t.integer :projects_limit
      t.integer :languages_limit
      t.boolean :permission_system, null: false
      t.boolean :validations, null: false
      t.boolean :key_history, null: false
      t.boolean :export_hierarchy, null: false
      t.boolean :post_processing, null: false
      t.boolean :project_activity, null: false
      t.boolean :over_the_air, null: false
      t.boolean :tags, null: false
      t.boolean :machine_translation_suggestions, null: false
      t.boolean :machine_translation_language, null: false
      t.boolean :machine_translation_auto_translate, null: false
      t.integer :machine_translation_character_limit
      t.boolean :html_editor, null: false
      t.timestamps
    end

    add_index :plans, :name, unique: true

    add_reference :organizations, :plan, type: :uuid, null: true
    add_foreign_key :organizations, :plans, on_delete: :nullify
  end
end
