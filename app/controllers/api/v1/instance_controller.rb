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
             sidekiq_processes: sidekiq_processes.size,
             email_confirmation_required: ENV.fetch('EMAIL_CONFIRMATION_REQUIRED', nil) == 'true',
             domain_filter: Setting.domain_filter,
             sign_up_enabled: Setting.sign_up_enabled
           }
  end

  def domain_filter
    authorize :instance, :domain_filter?

    domain_filter = params['instance']['domain_filter']

    Setting.domain_filter = domain_filter

    render json: { error: false, message: 'OK' }
  end

  def sign_up_enabled
    authorize :instance, :sign_up_enabled?

    sign_up_enabled = params['instance']['sign_up_enabled']

    Setting.sign_up_enabled = sign_up_enabled

    render json: { error: false, message: 'OK' }
  end
end
