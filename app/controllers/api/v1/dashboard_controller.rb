class Api::V1::DashboardController < Api::V1::ApiController
  # Returns relevant activity for a user.
  def activity
    limit = 5
    if params[:limit].present?
      limit = params[:limit].to_i || 5
      limit = 1 if limit < 1
      limit = 20 if limit > 20
    end

    versions = PaperTrail::Version.where(project_id: current_user.projects).limit(limit).order(created_at: :desc)

    options = {}
    options[:include] = [:user, :project]
    options[:params] = { current_user: current_user }
    render json: ActivitySerializer.new(versions, options).serialized_json
  end
end