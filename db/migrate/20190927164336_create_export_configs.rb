class CreateExportConfigs < ActiveRecord::Migration[5.2]
  def change
    create_table :export_configs, id: :uuid do |t|
      t.string :name, null: false
      t.string :file_path, null: false
      t.string :default_language_file_path, null: false
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end

    add_index :export_configs, [:project_id, :name], unique: true
  end
end
