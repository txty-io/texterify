class Api::V1::TranslationsController < Api::V1::ApiController
  before_action :check_if_user_activated

  def info_for_paper_trail
    { project_id: params[:project_id] }
  end

  def create
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:key_id])

    if params[:export_config_id].present?
      translation =
        key.translations.find_by(language_id: params[:language_id], export_config_id: params[:export_config_id])
    else
      translation = key.translations.find_by(language_id: params[:language_id], export_config_id: nil)
    end

    if translation
      authorize translation

      if translation.update(translation_params)
        render json: TranslationSerializer.new(translation).serialized_json

        if params[:trigger_auto_translate]
          translation.auto_translate_untranslated
        end
      else
        render json: { errors: translation.errors.details }, status: :bad_request
      end
    else
      if params[:language_id].present?
        language = project.languages.find(params[:language_id])
      else
        language = project.languages.find_by(is_default: true)

        if !language
          skip_authorization

          render json: { error: 'NO_DEFAULT_LANGUAGE_SPECIFIED' }, status: :bad_request
          return
        end
      end

      translation = Translation.new(translation_params)
      translation.language = language
      translation.key = key
      if params[:export_config_id]
        export_config = project.export_configs.find(params[:export_config_id])
        translation.export_config = export_config
      end

      authorize translation

      if translation.save
        render json: TranslationSerializer.new(translation).serialized_json

        if params[:trigger_auto_translate]
          translation.auto_translate_untranslated
        end
      else
        render json: { errors: translation.errors.details }, status: :bad_request
      end
    end

    translation.check_validations
  end

  private

  def translation_params
    params.require(:translation).permit(:content)
  end
end
