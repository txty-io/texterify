class AddReleasesIndex < ActiveRecord::Migration[6.0]
  def change
    add_index :releases, [:export_config_id, :version], unique: true
  end
end
