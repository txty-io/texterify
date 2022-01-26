class AddWordpressContentRefToKeys < ActiveRecord::Migration[6.1]
  def change
    add_reference :keys, :wordpress_content, type: :uuid, index: true
    add_foreign_key :keys, :wordpress_contents, on_delete: :nullify
  end
end
