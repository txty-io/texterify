class Api::V1::MembersController < Api::V1::ApiController
  before_action :check_if_allowed, except: [:index]

  def index
    project = current_user.projects.find(params[:project_id])
    render json: UserSerializer.new(project.users).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])
    user = User.find_by!(email: params[:email])

    if !project.users.include?(user)
      project_column = ProjectColumn.new
      project_column.project = project
      project_column.user = user
      project_column.save!
      project.users << user
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

    member_to_remove = project.users.find(params[:id])
    project.users.delete(member_to_remove)

    render json: {
      message: 'User removed from team'
    }
  end

  private

  def check_if_allowed
    project = current_user.projects.find(params[:project_id])

    # if !current_user.admin_of?(project)
    #   render json: {
    #     errors: [
    #       {
    #         details: 'You are not allowed to do this.'
    #       }
    #     ]
    #   }
    #   return
    # end
  end
end
