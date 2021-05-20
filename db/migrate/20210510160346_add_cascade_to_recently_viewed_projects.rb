class AddCascadeToRecentlyViewedProjects < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key :recently_viewed_projects, :projects
    add_foreign_key :recently_viewed_projects, :projects, on_delete: :cascade

    remove_foreign_key :recently_viewed_projects, :users
    add_foreign_key :recently_viewed_projects, :users, on_delete: :cascade
  end
end
