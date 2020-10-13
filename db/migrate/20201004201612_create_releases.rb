class CreateReleases < ActiveRecord::Migration[6.0]
  def change
    create_table :releases, id: :uuid do |t|
      t.integer :from_version, null: false
      t.integer :to_version, null: false
      t.string :url, null: false
      t.references :export_config, index: true, null: false, type: :uuid, foreign_key: true

      t.timestamps
    end

    add_index :releases, [:export_config_id, :from_version, :to_version], unique: true, name: "index_releases_unique"
  end
end
