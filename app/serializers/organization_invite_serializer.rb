class OrganizationInviteSerializer
  include FastJsonapi::ObjectSerializer

  attributes :id, :email, :organization_id, :role, :created_at
end
