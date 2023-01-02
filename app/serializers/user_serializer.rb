class UserSerializer
  include FastJsonapi::ObjectSerializer
  extend ApplicationHelper
  attributes :id, :username, :email, :is_superadmin, :deactivated, :deactivated_reason

  attribute :role, if: proc { |_, params| params[:project] } do |object, params|
    project_user = ProjectUser.find_by(project_id: params[:project].id, user_id: object.id)
    organization_user = OrganizationUser.find_by(organization_id: params[:project].organization_id, user_id: object.id)

    if project_user && organization_user
      higher_role?(project_user.role, organization_user.role) ? project_user.role : organization_user.role
    elsif project_user
      project_user.role
    else
      organization_user&.role
    end
  end

  attribute :user_deactivated_for_project, if: proc { |_, params| params[:project] } do |object, params|
    project_user = ProjectUser.find_by(project_id: params[:project].id, user_id: object.id)
    project_user&.deactivated
  end

  attribute :role_source, if: proc { |_, params| params[:project] } do |object, params|
    project_user = ProjectUser.find_by(project_id: params[:project].id, user_id: object.id)
    project_user ? 'project' : 'organization'
  end

  attribute :role_organization, if: proc { |_, params| params[:organization] } do |object, params|
    OrganizationUser.find_by(organization_id: params[:organization].id, user_id: object.id)&.role
  end
end
