class RecreateActiveStorageTables < ActiveRecord::Migration[6.0]
  def change
    drop_table :active_storage_attachments
    drop_table :active_storage_blobs

   create_table :active_storage_blobs, id: :uuid do |t|
      t.string   :key,        null: false
      t.string   :filename,   null: false
      t.string   :content_type
      t.text     :metadata
      t.bigint   :byte_size,  null: false
      t.string   :checksum,   null: false
      t.datetime :created_at, null: false

      t.index [ :key ], unique: true
    end

    create_table :active_storage_attachments, id: :uuid do |t|
      t.string     :name,     null: false
      t.references :record,   null: false, polymorphic: true, index: false, type: :uuid
      t.references :blob,     null: false, type: :uuid

      t.datetime :created_at, null: false

      t.index [ :record_type, :record_id, :name, :blob_id ], name: "index_active_storage_attachments_uniqueness", unique: true
      t.foreign_key :active_storage_blobs, column: :blob_id
    end

    # execute "TRUNCATE TABLE active_storage_attachments CASCADE;"
    # execute "TRUNCATE TABLE active_storage_blobs CASCADE;"

    # remove_foreign_key :active_storage_attachments, :active_storage_blobs, column: :blob_id

    # add_column :active_storage_attachments, :uuid, :uuid, default: -> { "gen_random_uuid()" }, null: false
    # change_table :active_storage_attachments do |t|
    #   t.remove :id
    #   t.rename :uuid, :id
    # end
    # execute "ALTER TABLE active_storage_attachments ADD PRIMARY KEY (id);"

    # add_column :active_storage_blobs, :uuid, :uuid, default: -> { "gen_random_uuid()" }, null: false
    # change_table :active_storage_blobs do |t|
    #   t.remove :id
    #   t.rename :uuid, :id
    # end
    # execute "ALTER TABLE active_storage_blobs ADD PRIMARY KEY (id);"

    # add_foreign_key :active_storage_attachments, :active_storage_blobs, column: :blob_id
  end
end
