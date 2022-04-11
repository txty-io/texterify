class Api::V1::ForbiddenWordsListsController < Api::V1::ApiController
  def index
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    forbidden_words_lists = project.forbidden_words_lists

    options = {}
    options[:meta] = { total: project.forbidden_words_lists.size }
    options[:include] = [:project]
    render json:
             ForbiddenWordsListSerializer.new(
               forbidden_words_lists.order('id ASC').offset(page * per_page).limit(per_page),
               options
             ).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])

    unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
      render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
      return
    end

    if params[:language_id] && !project.languages.exists?(id: params[:language_id])
      skip_authorization
      render json: { error: true, details: 'LANGUAGE_NOT_FOUND' }, status: :bad_request
      return
    end

    forbidden_words_list = ForbiddenWordsList.new(forbidden_words_list_params)
    forbidden_words_list.project = project

    authorize forbidden_words_list

    unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
      return
    end

    if forbidden_words_list.save
      render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_CREATED' }, status: :ok
    else
      render json: { error: false, details: language.errors.details }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    forbidden_words_list = project.forbidden_words_lists.find(params[:id])
    authorize forbidden_words_list

    unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
      render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
      return
    end

    if params[:language_id] && !project.languages.exists?(id: params[:language_id])
      skip_authorization
      render json: { error: true, details: 'LANGUAGE_NOT_FOUND' }, status: :bad_request
      return
    end

    forbidden_words_list.name = params[:name]
    forbidden_words_list.content = params[:content]
    forbidden_words_list.language_id = params[:language_id]

    if forbidden_words_list.save
      render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_UPDATED' }
    else
      render json: { error: true, details: forbidden_words_list.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    forbidden_words_lists = project.forbidden_words_lists.find(params[:id])
    authorize forbidden_words_lists
    forbidden_words_lists.destroy

    render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_DELETED' }
  end

  private

  def forbidden_words_list_params
    params.permit(:name, :content, :language_id)
  end
end
