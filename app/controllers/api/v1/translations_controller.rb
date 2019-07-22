class Api::V1::TranslationsController < Api::V1::ApiController
  def info_for_paper_trail
    { project_id: params[:project_id] }
  end

  def create
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:key_id])

    if key.translations.find_by(language_id: params[:language_id])
      render json: {
        message: 'Translation already created'
      }
      return
    end

    language = project.languages.find(params[:language_id])

    translation = Translation.new(translation_params)
    translation.language = language
    translation.key = key

    if translation.save
      render json: {
        message: 'Translation created'
      }
    else
      render json: {
        error: true,
        message: 'Error while creating translation'
      }, status: :bad_request
    end
  end

  def update
    translation = Translation.find(params[:id])

    if translation.update(translation_params)
      render json: {
        message: 'Translation updated'
      }
    else
      render json: {
        error: true,
        errors: translation.errors.as_json
      }, status: :bad_request
    end
  end

  def destroy
  end

  private

  def translation_params
    params.require(:translation).permit(:content)
  end
end
