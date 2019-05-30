class AddProjectIdToVersions < ActiveRecord::Migration[5.1]
  def change
    add_reference :versions, :project, type: :uuid, foreign_key: true
  end
end
