class AddKeyIdToWordpressContents < ActiveRecord::Migration[6.1]
  def change
    remove_column :keys, :wordpress_content_id
    add_reference :wordpress_contents, :key, type: :uuid, null: true
    add_foreign_key :wordpress_contents, :keys, on_delete: :nullify
  end
end
