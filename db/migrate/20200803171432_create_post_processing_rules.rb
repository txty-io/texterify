class CreatePostProcessingRules < ActiveRecord::Migration[6.0]
  def change
    create_table :post_processing_rules, id: :uuid do |t|
      t.string :name, null: false
      t.string :search_for, null: false
      t.string :replace_with, null: false
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.references :export_config, index: true, type: :uuid, foreign_key: true
      t.timestamps null: false
    end

    add_index :post_processing_rules, [:project_id, :name], unique: true
  end
end
