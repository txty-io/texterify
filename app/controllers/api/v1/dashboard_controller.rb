class Api::V1::DashboardController < Api::V1::ApiController
  # Returns relevant activity for a user.
  def activity
    skip_authorization
    limit = 5
    if params[:limit].present?
      limit = params[:limit].to_i || 5
      if limit < 1
        limit = 1
      end
      if limit > 20
        limit = 20
      end
    end

    versions = PaperTrail::Version.where(project_id: current_user.projects).limit(limit).order(created_at: :desc)

    options = {}
    options[:include] = [:user, :project, :key, :language, :'language.country_code']
    options[:params] = { current_user: current_user }
    render json: ActivitySerializer.new(versions, options).serialized_json
  end
end
