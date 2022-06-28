class ProjectSerializer
  include FastJsonapi::ObjectSerializer
  include EnabledFeaturesHelper
  extend ApplicationHelper

  attributes :id,
             :name,
             :description,
             :machine_translation_enabled,
             :auto_translate_new_keys,
             :auto_translate_new_languages,
             :machine_translation_character_usage,
             :word_count,
             :character_count,
             :placeholder_start,
             :placeholder_end,
             :validate_leading_whitespace,
             :validate_trailing_whitespace,
             :validate_double_whitespace,
             :validate_https,
             :organization_id,
             :issues_count

  belongs_to :organization

  has_many :keys
  has_many :languages
  has_many :project_columns
  has_many :releases
  has_many :tags

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    organization_user =
      OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)

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
    organization_user =
      OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)

    if project_user && organization_user
      higher_role?(project_user.role, organization_user.role) ? 'project' : 'organization'
    elsif project_user
      'project'
    else
      organization_user ? 'organization' : nil
    end
  end

  attribute :enabled_features do |object|
    enabled_features_organization(object.organization)
  end

  attribute :all_features do
    Organization::FEATURES_PLANS
  end

  attribute :machine_translation_active do |object|
    ENV.fetch('DEEPL_API_TOKEN', nil).present? && object.machine_translation_enabled
  end

  attribute :current_user_deactivated, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    organization_user =
      OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)

    (!project_user || project_user.deactivated) && (!organization_user || organization_user.deactivated)
  end

  attribute :current_user_deactivated_reason, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    organization_user =
      OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)

    project_user&.deactivated_reason || organization_user&.deactivated_reason
  end

  attribute :current_user_in_project_organization, if: proc { |_, params| params[:current_user] } do |object, params|
    OrganizationUser.exists?(organization_id: object.organization_id, user_id: params[:current_user].id)
  end

  attribute :current_user_in_project, if: proc { |_, params| params[:current_user] } do |object, params|
    ProjectUser.exists?(project_id: object.id, user_id: params[:current_user].id)
  end
end
