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
    options[:include] = [:project]
    render json:
             ForbiddenWordsListSerializer.new(
               forbidden_words_lists.order('id ASC').offset(page * per_page).limit(per_page),
               options
             ).serialized_json
  end

  def create
    if params[:project_id]
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
    else
      organization = current_user.organizations.find(params[:organization_id])

      unless feature_enabled?(organization, Organization::FEATURE_VALIDATIONS)
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

      unless feature_enabled?(project, Organization::FEATURE_VALIDATIONS)
        render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
        return
      end
    else
      organization = current_user.organizations.find(params[:organization_id])
      forbidden_words_list = organization.forbidden_words_lists.find(params[:id])

      unless feature_enabled?(organization, Organization::FEATURE_VALIDATIONS)
        render json: { error: true, details: 'FEATURE_NOT_AVAILABLE_FOR_PLAN' }
        return
      end
    end

    authorize forbidden_words_list

    if project && params[:language_id] && !project.languages.exists?(id: params[:language_id])
      skip_authorization
      render json: { error: true, details: 'LANGUAGE_NOT_FOUND' }, status: :bad_request
      return
    end

    forbidden_words_list.name = params[:name]
    forbidden_words_list.content = params[:content]

    if project && params[:language_id]
      forbidden_words_list.language_id = params[:language_id]
    end

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

    forbidden_words_lists.destroy

    render json: { error: false, details: 'FORBIDDEN_WORDS_LIST_DELETED' }
  end

  private

  def forbidden_words_list_params
    params.permit(:name, :content, :language_id)
  end
end
