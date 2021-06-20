class OrganizationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :trial_active, :machine_translation_character_usage, :machine_translation_character_limit
  has_many :projects

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.role
  end

  attribute :trial_ends_at do |object|
    object.trial_ends_at.nil? ? nil : object.trial_ends_at.strftime('%Y-%m-%d')
  end

  attribute :enabled_features do |object|
    if object.trial_active
      Organization::FEATURES_TRIAL
    elsif object.active_subscription&.plan == Subscription::PLAN_BASIC
      Organization::FEATURES_BASIC_PLAN
    elsif object.active_subscription&.plan == Subscription::PLAN_TEAM
      Organization::FEATURES_TEAM_PLAN
    elsif object.active_subscription&.plan == Subscription::PLAN_BUSINESS
      Organization::FEATURES_BUSINESS_PLAN
    elsif !License.all.empty?
      license = License.current_active

      if license && license.restrictions[:plan] == 'basic'
        Organization::FEATURES_BASIC_PLAN
      elsif license && license.restrictions[:plan] == 'team'
        Organization::FEATURES_TEAM_PLAN
      elsif license && license.restrictions[:plan] == 'business'
        Organization::FEATURES_BUSINESS_PLAN
      else
        []
      end
    else
      []
    end
  end

  attribute :all_features do
    Organization::FEATURES_PLANS
  end
end
