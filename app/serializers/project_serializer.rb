class ProjectSerializer
  include FastJsonapi::ObjectSerializer
  attributes :id, :name, :description
  belongs_to :organization
  has_many :keys
  has_many :languages
  has_many :project_columns

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    if project_user
      project_user.role
    else
      organization_user = OrganizationUser.find_by(organization_id: object.organization_id, user_id: params[:current_user].id)
      organization_user ? organization_user.role : nil
    end
  end

  attribute :current_user_role_source, if: proc { |_, params| params[:current_user] } do |object, params|
    project_user = ProjectUser.find_by(project_id: object.id, user_id: params[:current_user].id)
    if project_user
      'project'
    else
      'organization'
    end
  end
end
