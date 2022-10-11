class Api::V1::TagsController < Api::V1::ApiController
  def index
    skip_authorization

    project = current_user.projects.find(params[:project_id])
    unless feature_enabled?(project, Organization::FEATURE_TAGS)
      return
    end

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    tags = project.tags
    if params[:search]
      tags = project.tags.where('name ilike :search', search: "%#{params[:search]}%")
    end

    options = {}
    options[:meta] = { total: project.tags.size }
    options[:include] = []
    render json:
             TagSerializer.new(tags.order('name ASC').offset(page * per_page).limit(per_page), options).serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])
    unless feature_enabled?(project, Organization::FEATURE_TAGS)
      return
    end

    tag = Tag.new(tag_params)
    tag.project = project
    tag.custom = false

    authorize tag

    if tag.save
      render json: { error: false, details: 'TAG_CREATED' }, status: :ok
    else
      render json: { error: true, errors: tag.errors.details }, status: :bad_request
    end
  end

  def update
    project = current_user.projects.find(params[:project_id])
    unless feature_enabled?(project, Organization::FEATURE_TAGS)
      return
    end

    tag = project.tags.find(params[:id])

    authorize tag

    if tag.update(tag_params)
      render json: TagSerializer.new(tag).serialized_json
    else
      render json: { errors: tag.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    unless feature_enabled?(project, Organization::FEATURE_TAGS)
      return
    end

    tag = project.tags.find(params[:id])

    authorize tag

    if tag.destroy
      render json: { error: false, details: 'TAG_DESTROYED' }
    else
      render json: { error: true, errors: tag.errors.details }, status: :bad_request
    end
  end

  private

  def tag_params
    params.require(:tag).permit(:name, :disable_translation_for_translators)
  end
end
