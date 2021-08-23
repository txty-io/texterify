class ProjectInviteSerializer
  include FastJsonapi::ObjectSerializer

  attributes :id, :email, :project_id, :role, :created_at
end
