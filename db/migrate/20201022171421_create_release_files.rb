class CreateReleaseFiles < ActiveRecord::Migration[6.0]
  def change
    remove_column :releases, :url

    create_table :release_files, id: :uuid do |t|
      t.string :language_code, null: false
      t.string :country_code
      t.string :url, null: false
      t.references :release, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end

    add_index :release_files, [:language_code, :country_code, :url, :release_id], unique: true, name: "index_release_files_unique"
  end
end
