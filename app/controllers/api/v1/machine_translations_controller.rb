class Api::V1::MachineTranslationsController < Api::V1::ApiController
  before_action :verify_deepl_configured

  def usage
    authorize :machine_translation, :usage?

    deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])
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

    machine_translation_memory =
      MachineTranslationMemory.find_by(
        from: translation.content,
        source_language_code_id: translation.language.language_code_id,
        target_language_code_id: target_language.language_code_id
      )

    if machine_translation_memory.present?
      render json: { translation: machine_translation_memory.to }
    else
      character_count = translation.content.length
      organization = project.organization

      if organization.exceeds_machine_translation_usage?(character_count)
        render json: {
                 error: true,
                 message: 'MACHINE_TRANSLATIONS_USAGE_EXCEEDED',
                 data: {
                   machine_translation_character_usage: organization.machine_translation_character_usage,
                   machine_translation_character_limit: organization.machine_translation_character_limit,
                   translation_character_count: character_count
                 }
               },
               status: :bad_request
        return
      end

      project.increment(:machine_translation_character_usage, character_count)
      organization.increment(:machine_translation_character_usage, character_count)

      project.save!
      organization.save!

      deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])
      deepl_translation =
        deepl_client.translate(
          translation.content,
          translation.language.language_code.code,
          target_language.language_code.code
        )

      MachineTranslationMemory.create(
        from: translation.content,
        to: deepl_translation,
        source_language_code_id: translation.language.language_code_id,
        target_language_code_id: target_language.language_code_id
      )

      render json: { translation: deepl_translation }
    end
  end

  def machine_translate_language
    project = current_user.projects.find(params[:project_id])
    language = project.languages.find(params[:language_id])

    if !project.feature_enabled?(Organization::FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE)
      skip_authorization

      render json: { error: true, message: 'FEATURE_NOT_AVAILABLE' }, status: :bad_request
      return
    end

    authorize language

    language.translate_untranslated_using_machine_translation

    render json: { success: true, details: 'OK' }
  end

  private

  def verify_deepl_configured
    if ENV['DEEPL_API_TOKEN'].blank?
      render json: { error: true, message: 'NOT_CONFIGURED' }, status: :bad_request
    end
  end
end
