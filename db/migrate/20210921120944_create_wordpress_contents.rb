class CreateWordpressContents < ActiveRecord::Migration[6.1]
  def change
    create_table :wordpress_contents, id: :uuid do |t|
      t.integer :wordpress_id, null: false
      t.string :wordpress_slug
      t.datetime :wordpress_modified, null: false
      t.string :wordpress_type, null: false
      t.string :wordpress_status, null: false
      t.string :wordpress_content
      t.string :wordpress_content_type, null: false
      t.string :wordpress_language_id
      t.string :wordpress_language_language_code
      t.string :wordpress_language_country_code
      t.string :wordpress_title
      t.string :wordpress_language_name

      t.references :project, index: true, null: false, type: :uuid, foreign_key: { on_delete: :cascade }

      t.index [:wordpress_id, :wordpress_content_type], unique: true, name: 'index_wp_id_wp_content_type'

      t.timestamps
    end
  end
end
