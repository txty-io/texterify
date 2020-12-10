class OrganizationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name
  has_many :projects
  has_many :subscriptions

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.role
  end
end
