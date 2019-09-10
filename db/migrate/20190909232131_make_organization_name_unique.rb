class MakeOrganizationNameUnique < ActiveRecord::Migration[5.2]
  def change
    add_index :organizations, :name, unique: true
  end
end
