class Api::V1::TranslationsController < Api::V1::ApiController
  def info_for_paper_trail
    { project_id: params[:project_id] }
  end

  before_action :set_current_project

  # Sets the current project for the request and throws an error in case the project has been disabled.
  def set_current_project
    @project = current_user.projects.find(params[:project_id])

    if @project.disabled
      render json: { error: true, error_type: 'PROJECT_IS_DISABLED' }, status: :forbidden
      false
    end
  end

  def create
    key = @project.keys.find(params[:key_id])

    if params[:flavor_id].present?
      translation = key.translations.find_by(language_id: params[:language_id], flavor_id: params[:flavor_id])
    else
      translation = key.translations.find_by(language_id: params[:language_id], flavor_id: nil)
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
        language = @project.languages.find(params[:language_id])
      else
        language = @project.languages.find_by(is_default: true)

        if !language
          skip_authorization

          render json: { error: 'NO_DEFAULT_LANGUAGE_SPECIFIED' }, status: :bad_request
          return
        end
      end

      translation = Translation.new(translation_params)
      translation.language = language
      translation.key = key
      if params[:flavor_id]
        flavor = @project.flavors.find(params[:flavor_id])
        translation.flavor = flavor
      end

      authorize translation

      if translation.save
        render json: TranslationSerializer.new(translation).serialized_json
        translation.check_all

        if params[:trigger_auto_translate]
          translation.auto_translate_untranslated
        end
      else
        render json: { errors: translation.errors.details }, status: :bad_request
      end
    end
  end

  private

  def translation_params
    params.require(:translation).permit(:zero, :one, :two, :few, :many, :content)
  end
end
