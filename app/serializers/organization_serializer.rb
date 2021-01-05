class OrganizationSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :trial_active
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

  attribute :enabled_features do |object|
    if object.subscription&.plan == Subscription::PLAN_TEAM
      Organization::FEATURES_TEAM_PLAN
    elsif object.subscription&.plan == Subscription::PLAN_BUSINESS
      Organization::FEATURES_BUSINESS_PLAN
    elsif !License.all.empty?
      license = License.all.order(created_at: :desc).first

      if license.license.plan == 'team'
        Organization::FEATURES_TEAM_PLAN
      elsif license.license.plan == 'business'
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
