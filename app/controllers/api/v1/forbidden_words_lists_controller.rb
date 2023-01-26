class Api::V1::ForbiddenWordsListsController < Api::V1::ApiController
  def index
    skip_authorization

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      forbidden_words_lists = project.forbidden_words_lists
    else
      organization = current_user.organizations.find(params[:organization_id])
      forbidden_words_lists = organization.forbidden_words_lists
    end

    options = {}
    options[:meta] = { total: forbidden_words_lists.size }
    options[:include] = [:project, :language_code, :country_code]
    render json:
             ForbiddenWordsListSerializer.new(
               forbidden_words_lists.order('id ASC').offset(page * per_page).limit(per_page),
               options
             ).serialized_json
  end

  def create
    if params[:project_id]
      project = current_user.projects.find(params[:project_id])

      unless project.feature_enabled?(Plan::FEATURE_VALIDATIONS)
        render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
        return
      end

      forbidden_words_list = ForbiddenWordsList.new(forbidden_words_list_params)
      forbidden_words_list.project = project
    else
      organization = current_user.organizations.find(params[:organization_id])

      unless organization.feature_enabled?(Plan::FEATURE_VALIDATIONS)
        render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
        return
      end

      forbidden_words_list = ForbiddenWordsList.new(forbidden_words_list_params)
      forbidden_words_list.organization = organization
    end

    authorize forbidden_words_list

    if forbidden_words_list.save
      render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_CREATED' }, status: :ok
    else
      render json: { error: false, details: forbidden_words_list.errors.details }, status: :bad_request
    end
  end

  def update
    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      forbidden_words_list = project.forbidden_words_lists.find(params[:id])

      unless project.feature_enabled?(Plan::FEATURE_VALIDATIONS)
        render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
        return
      end
    else
      organization = current_user.organizations.find(params[:organization_id])
      forbidden_words_list = organization.forbidden_words_lists.find(params[:id])

      unless organization.feature_enabled?(Plan::FEATURE_VALIDATIONS)
        render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
        return
      end
    end

    authorize forbidden_words_list

    forbidden_words_list.update(forbidden_words_list_params)

    if forbidden_words_list.save
      render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_UPDATED' }
    else
      render json: { error: true, details: forbidden_words_list.errors.details }, status: :bad_request
    end
  end

  def destroy
    if params[:project_id]
      project = current_user.projects.find(params[:project_id])
      forbidden_words_list = project.forbidden_words_lists.find(params[:id])
    else
      organization = current_user.organizations.find(params[:organization_id])
      forbidden_words_list = organization.forbidden_words_lists.find(params[:id])
    end

    authorize forbidden_words_list

    forbidden_words_list.destroy

    render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_DELETED' }
  end

  private

  def forbidden_words_list_params
    params.permit(:name, :content, :country_code_id, :language_code_id)
  end
end
