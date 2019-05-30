class CreateProjectColumns < ActiveRecord::Migration[5.1]
  def change
    create_table :project_columns, id: :uuid do |t|
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.references :user, index: true, null: false, type: :uuid, foreign_key: true
      t.boolean :show_name
      t.boolean :show_description
      t.timestamps
    end
  end
end
