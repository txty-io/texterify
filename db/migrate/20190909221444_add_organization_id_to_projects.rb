class AddOrganizationIdToProjects < ActiveRecord::Migration[5.2]
  def change
    add_reference :projects, :organization, type: :uuid, foreign_key: true
  end
end
