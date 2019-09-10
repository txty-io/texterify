class CreateOrganizations < ActiveRecord::Migration[5.2]
  def change
    create_table :organizations, id: :uuid do |t|
      t.string :name, null: false
      t.timestamps null: false
    end
  end
end
