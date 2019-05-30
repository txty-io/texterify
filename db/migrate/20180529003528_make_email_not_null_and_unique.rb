class MakeEmailNotNullAndUnique < ActiveRecord::Migration[5.1]
  def change
    change_column :users, :email, :string, null: false, unique: true
  end
end
