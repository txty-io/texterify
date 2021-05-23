class ProjectSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :name, :description, :validate_leading_whitespace, :validate_trailing_whitespace, :validate_double_whitespace, :validate_https
  belongs_to :organization
  has_many :keys
  has_many :languages
  has_many :project_columns
  has_many :releases

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    organization_user = OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)

    if project_user && organization_user
      higher_role?(project_user.role, organization_user.role) ? project_user.role : organization_user.role
    elsif project_user
      project_user.role
    else
      organization_user ? organization_user.role : nil
    end
  end

  attribute :current_user_role_source, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    organization_user = OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)

    if project_user && organization_user
      higher_role?(project_user.role, organization_user.role) ? 'project' : 'organization'
    elsif project_user
      'project'
    else
      organization_user ? 'organization' : nil
    end
  end

  attribute :enabled_features do |object|
    if object.organization&.trial_active
      Organization::FEATURES_BUSINESS_PLAN
    elsif object.organization&.active_subscription&.plan == Subscription::PLAN_BASIC
      Organization::FEATURES_BASIC_PLAN
    elsif object.organization&.active_subscription&.plan == Subscription::PLAN_TEAM
      Organization::FEATURES_TEAM_PLAN
    elsif object.organization&.active_subscription&.plan == Subscription::PLAN_BUSINESS
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
