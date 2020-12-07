class CreateUserLicenses < ActiveRecord::Migration[6.0]
  def change
    create_table :user_licenses, id: :uuid do |t|
      t.text :data, null: false
      t.timestamps
    end
  end
end
