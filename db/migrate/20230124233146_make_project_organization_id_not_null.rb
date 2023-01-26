class MakeProjectOrganizationIdNotNull < ActiveRecord::Migration[6.1]
  def change
    change_column :projects, :organization_id, :uuid, null: false
  end
end
