class InstanceUserSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id,
             :username,
             :email,
             :is_superadmin,
             :deactivated,
             :deactivated_reason,
             :confirmed,
             :sign_in_count,
             :created_at,
             :last_sign_in_at
end
