class OrganizationSerializer
  include FastJsonapi::ObjectSerializer
  include EnabledFeaturesHelper

  attributes :id,
             :name,
             :trial_active,
             :machine_translation_character_usage,
             :machine_translation_character_limit,
             :max_users_reached
  has_many :projects

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.role
  end

  attribute :trial_ends_at do |object|
    object.trial_ends_at.nil? ? nil : object.trial_ends_at.strftime('%Y-%m-%d')
  end

  attribute :enabled_features do |object|
    enabled_features_organization(object)
  end

  attribute :all_features do
    Organization::FEATURES_PLANS
  end

  attribute :current_user_deactivated, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.deactivated
  end

  attribute :current_user_deactivated_reason, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.deactivated_reason
  end
end
