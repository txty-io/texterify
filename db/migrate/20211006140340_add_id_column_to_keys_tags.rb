class AddIdColumnToKeysTags < ActiveRecord::Migration[6.1]
  def change
    add_column :keys_tags, :id, :uuid
    execute 'ALTER TABLE keys_tags ADD PRIMARY KEY (id);'
    execute 'ALTER TABLE keys_tags ALTER COLUMN id SET DEFAULT gen_random_uuid();'
  end
end
