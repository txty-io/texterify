class CreateKeysTags < ActiveRecord::Migration[6.1]
  def change
    create_join_table :tags,
                      :keys,
                      id: :uuid,
                      column_options: {
                        type: :uuid,
                        foreign_key: true,
                        foreign_key: {
                          on_delete: :cascade
                        }
                      } do |t|
      t.timestamps null: false
      t.index [:tag_id]
      t.index [:key_id]
      t.index [:tag_id, :key_id], unique: true
    end
  end
end
