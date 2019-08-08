class AddDeletedIndexToVersions < ActiveRecord::Migration[5.2]
  def change
    add_index :versions, %i(item_type item_id)
  end
end
