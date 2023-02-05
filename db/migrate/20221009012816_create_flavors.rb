class CreateFlavors < ActiveRecord::Migration[6.1]
  def change
    create_table :flavors, id: :uuid do |t|
      t.string :name, null: false
      t.references :project, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.timestamps
    end

    add_reference :export_configs, :flavor, type: :uuid, foreign_key: { on_delete: :cascade }
    add_reference :translations, :flavor, type: :uuid, foreign_key: { on_delete: :cascade }

    ExportConfig.all.each do |export_config|
      puts "Migrating export config with name: #{export_config.name}"

      # Create a new flavor for every export config.
      flavor = Flavor.new
      flavor.name = export_config.name
      flavor.project_id = export_config.project_id
      flavor.save!

      # Assign the export config to the new flavor.
      export_config.update_column(:flavor_id, flavor.id)

      # Reassign all translations to the flavor.
      Translation.where(export_config_id: export_config.id).update_all(flavor_id: flavor.id)
    end

    remove_column :translations, :export_config_id
  end
end
