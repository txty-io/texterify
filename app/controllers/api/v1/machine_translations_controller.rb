class Api::V1::MachineTranslationsController < Api::V1::ApiController
  before_action :verify_deepl_configured
  before_action :check_if_user_activated, except: [:usage, :source_languages, :target_languages]

  def usage
    authorize :machine_translation, :usage?

    deepl_client = Deepl::Client.new
    render json: deepl_client.usage
  rescue DeeplInvalidTokenException => _e
    render json: { error: true, message: 'MACHINE_TRANSLATION_INVALID_TOKEN' }, status: :bad_request
  end

  def source_languages
    authorize :machine_translation, :source_languages?

    render json: DeeplSourceLanguageSerializer.new(DeeplSourceLanguage.all).serialized_json
  end

  def target_languages
    authorize :machine_translation, :target_languages?

    render json: DeeplTargetLanguageSerializer.new(DeeplTargetLanguage.all).serialized_json
  end

  def suggestion
    project = current_user.projects.find(params[:project_id])
    translation = project.translations.find(params[:translation_id])
    target_language = project.languages.find(params[:language_id])

    if !project.feature_enabled?(Plan::FEATURE_MACHINE_TRANSLATION_SUGGESTIONS)
      skip_authorization

      render json: { error: true, message: 'FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end

    authorize translation

    suggestion = Texterify::MachineTranslation.translate(project, translation, target_language)

    render json: { translation: suggestion }
  rescue Texterify::MachineTranslation::OrganizationMachineTranslationUsageExceededException => e
    render json: { error: true, message: 'MACHINE_TRANSLATION_USAGE_EXCEEDED', data: e.details }, status: :bad_request
    return
  end

  def machine_translate_language
    project = current_user.projects.find(params[:project_id])
    language = project.languages.find(params[:language_id])

    if !project.feature_enabled?(Plan::FEATURE_MACHINE_TRANSLATION_LANGUAGE)
      skip_authorization

      render json: { error: true, message: 'FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end

    authorize language

    translation_success = language.translate_untranslated_using_machine_translation(current_user)

    if translation_success
      render json: { error: false, message: 'OK' }
    else
      render json: { error: true, message: 'FAILED_TO_MACHINE_TRANSLATE' }
    end
  rescue Texterify::MachineTranslation::OrganizationMachineTranslationUsageExceededException => e
    render json: { error: true, message: 'MACHINE_TRANSLATION_USAGE_EXCEEDED', data: e.details }, status: :bad_request
  end

  private

  def verify_deepl_configured
    if ENV.fetch('DEEPL_API_TOKEN', nil).nil?
      render json: { error: true, message: 'MACHINE_TRANSLATION_TOKEN_NOT_CONFIGURED' }, status: :bad_request
    end
  end
end
