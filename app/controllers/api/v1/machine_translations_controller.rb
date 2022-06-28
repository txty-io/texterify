class Api::V1::MachineTranslationsController < Api::V1::ApiController
  before_action :verify_deepl_configured
  before_action :check_if_user_activated, except: [:usage, :source_languages, :target_languages]

  def usage
    authorize :machine_translation, :usage?

    deepl_client = Deepl::V2::Client.new
    render json: deepl_client.usage
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

    if !project.feature_enabled?(Organization::FEATURE_MACHINE_TRANSLATION_SUGGESTIONS)
      skip_authorization

      render json: { error: true, message: 'FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end

    authorize translation

    if translation.key.html_enabled
      render json: { error: true, message: 'MACHINE_TRANSLATIONS_FOR_HTML_KEYS_NOT_SUPPROTED' }, status: :bad_request
      return
    end

    suggestion = Texterify::MachineTranslation.translate(project, translation, target_language)

    render json: { translation: suggestion }
  rescue OrganizationMachineTranslationUsageExceededException => e
    render json: { error: true, message: 'MACHINE_TRANSLATIONS_USAGE_EXCEEDED', data: e.details }, status: :bad_request
    return
  end

  def machine_translate_language
    project = current_user.projects.find(params[:project_id])
    language = project.languages.find(params[:language_id])

    if !project.feature_enabled?(Organization::FEATURE_MACHINE_TRANSLATION_LANGUAGE)
      skip_authorization

      render json: { error: true, message: 'FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end

    authorize language

    translation_success = language.translate_untranslated_using_machine_translation

    if translation_success
      render json: { error: false, message: 'OK' }
    else
      render json: { error: true, message: 'FAILED_TO_MACHINE_TRANSLATE' }
    end
  rescue OrganizationMachineTranslationUsageExceededException => e
    render json: { error: true, message: 'MACHINE_TRANSLATIONS_USAGE_EXCEEDED', data: e.details }, status: :bad_request
  end

  private

  def verify_deepl_configured
    if ENV.fetch('DEEPL_API_TOKEN', nil).nil?
      render json: { error: true, message: 'NOT_CONFIGURED' }, status: :bad_request
    end
  end
end
