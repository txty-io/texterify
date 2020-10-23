class ChangeReleaseVersionColumns < ActiveRecord::Migration[6.0]
  def change
    remove_column :releases, :to_version
    rename_column :releases, :from_version, :version
  end
end
