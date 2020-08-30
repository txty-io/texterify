class CreateLanguageConfigs < ActiveRecord::Migration[6.0]
  def change
    create_table :language_configs, id: :uuid do |t|
      t.string :language_code, null: false
      t.references :language, index: true, type: :uuid, foreign_key: true
      t.references :export_config, index: true, type: :uuid, foreign_key: true
      t.timestamps
    end

    add_index :language_configs, [:language_id, :export_config_id], unique: true
  end
end
