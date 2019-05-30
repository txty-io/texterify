class CreateProjectColumnsLanguages < ActiveRecord::Migration[5.1]
  def change
    create_join_table :project_columns, :languages, id: :uuid do |t|
      t.references :project_column, index: true, null: false, type: :uuid, foreign_key: true
      t.references :language, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps null: false
    end
  end
end
