class MakeInviteColumnsNotNull < ActiveRecord::Migration[6.1]
  def change
    change_column_null :organization_invites, :organization_id, false
    change_column_null :project_invites, :project_id, false
  end
end
