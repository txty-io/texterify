class Api::V1::InstanceController < Api::V1::ApiController
  def show
    authorize :instance, :show?

    # https://github.com/mperham/sidekiq/wiki/API#processes
    sidekiq_processes = Sidekiq::ProcessSet.new

    render json: {
             users_count: User.count,
             projects_count: Project.count,
             organizations_count: Organization.count,
             languages_count: Language.count,
             keys_count: Key.count,
             translations_count: Translation.count,
             releases_count: Release.count,
             is_cloud: Texterify.cloud?,
             sidekiq_processes: sidekiq_processes.size
           }
  end
end
