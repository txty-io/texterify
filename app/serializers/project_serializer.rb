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
             :character_count
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
    ENV['DEEPL_API_TOKEN'].present? && object.machine_translation_enabled
  end
end
