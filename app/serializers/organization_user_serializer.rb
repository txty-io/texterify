class OrganizationUserSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :role, :deactivated, :deactivated_reason

  belongs_to :user
  belongs_to :organization
end
