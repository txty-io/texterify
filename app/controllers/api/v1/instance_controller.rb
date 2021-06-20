class Api::V1::InstanceController < Api::V1::ApiController
  def show
    authorize :instance, :show?

    render json: {
             users_count: User.count,
             projects_count: Project.count,
             organizations_count: Organization.count,
             languages_count: Language.count,
             keys_count: Key.count,
             translations_count: Translation.count,
             releases_count: Release.count
           }
  end
end
