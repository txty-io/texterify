class AddPreviewUrlToReleaseFiles < ActiveRecord::Migration[6.0]
  def change
    add_column :release_files, :preview_url, :string, null: false, default: ""
    change_column :release_files, :preview_url, :string, default: nil
  end
end
