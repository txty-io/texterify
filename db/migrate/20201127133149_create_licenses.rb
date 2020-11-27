class CreateLicenses < ActiveRecord::Migration[6.0]
  def change
    create_table :licenses, id: :uuid do |t|
      t.text :data, null: false
      t.timestamps
    end
  end
end
