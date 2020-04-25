class CreateProjectColumnsLanguages < ActiveRecord::Migration[5.1]
  def change
    create_join_table :project_columns, :languages, id: :uuid, column_options: { type: :uuid, foreign_key: true } do |t|
      t.timestamps null: false
      t.index [:project_column_id]
      t.index [:language_id]
    end
  end
end
