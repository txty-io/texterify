class OrganizationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name
  has_many :projects

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.role
  end

  attribute :trial_ends_at do |object|
    if object.trial_ends_at.nil?
      nil
    else
      object.trial_ends_at.strftime('%Y-%m-%d')
    end
  end

  attribute :trial_active do |object|
    if object.trial_ends_at.nil?
      false
    else
      Time.now.utc < object.trial_ends_at
    end
  end
end
