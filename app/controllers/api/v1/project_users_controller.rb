class Api::V1::ProjectUsersController < Api::V1::ApiController
  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    options = {}
    options[:params] = { project: project }
    render json: UserSerializer.new(project.users, options).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])
    user = User.find_by!(email: params[:email])

    project_user = ProjectUser.new
    project_user.project = project
    project_user.user = user
    authorize project_user

    if !project.users.include?(user)
      project_user.save!

      project_column = ProjectColumn.new
      project_column.project = project
      project_column.user = user
      project_column.save!

      render json: {
        message: 'User added to the project'
      }
    else
      render json: {
        errors: [
          {
            details: 'User already in the project'
          }
        ]
      }
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    project_user = ProjectUser.find_by!(user_id: params[:id], project_id: project.id)
    authorize project_user

    if current_user.id == params[:id] && project.users.count == 1
      render json: {
        errors: [
          {
            details: "You can't remove yourself from the project if you are the only member"
          }
        ]
      }, status: :bad_request
      return
    end

    project_user.destroy

    render json: {
      message: 'User removed from project'
    }
  end

  def update
    project = current_user.projects.find(params[:project_id])
    project_user = ProjectUser.find_by(project_id: project.id, user_id: params[:id])

    unless project_user
      project_user = ProjectUser.new
      project_user.project = project
      project_user.user = User.find(params[:id])
    end

    authorize project_user

    project_user.role = params[:role]
    project_user.save!

    render json: {
      message: 'User role updated'
    }
  end
end
