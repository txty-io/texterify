class Api::V1::MachineTranslationsController < Api::V1::ApiController
  def usage
    authorize :machine_translation, :usage?

    deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])
    render json: deepl_client.usage
  end

  def source_languages
    authorize :machine_translation, :source_languages?

    deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])
    render json: deepl_client.source_languages
  end

  def target_languages
    authorize :machine_translation, :target_languages?

    deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])
    render json: deepl_client.target_languages
  end

  def translate
    project = current_user.projects.find(params[:project_id])
    translation = project.translations.find(params[:translation_id])
    target_language = project.languages.find(params[:language_id])

    authorize translation

    if translation.key.html_enabled
      render json: {
        error: true,
        message: 'MACHINE_TRANSLATIONS_FOR_HTML_KEYS_NOT_SUPPROTED'
      }, status: :bad_request
      return
    end

    machine_translation_memory = MachineTranslationMemory.find_by(
      from: translation.content,
      source_language_code_id: translation.language.language_code_id,
      target_language_code_id: target_language.language_code_id
    )

    if machine_translation_memory.present?
      render json: { translation: machine_translation_memory.to }
    else
      deepl_client = Deepl::V2::Client.new(ENV['DEEPL_API_TOKEN'])
      deepl_translation = deepl_client.translate(
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
end
