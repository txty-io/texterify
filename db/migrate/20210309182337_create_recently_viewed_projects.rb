class CreateRecentlyViewedProjects < ActiveRecord::Migration[6.0]
  def change
    create_table :recently_viewed_projects, id: :uuid do |t|
      t.datetime :last_accessed, null: false
      t.references :project, index: true, null: false, type: :uuid, foreign_key: true
      t.references :user, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps
    end

    add_index :recently_viewed_projects, [:project_id, :user_id], unique: true, name: "index_recently_viewed_projects_unique"
  end
end
