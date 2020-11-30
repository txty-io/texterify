class Api::V1::InstanceController < Api::V1::ApiController
  def show
    authorize :instance, :show?

    render json: {
      users_count: User.count,
      projects_count: Project.count,
      organizations_count: Organization.count
    }
  end
end
