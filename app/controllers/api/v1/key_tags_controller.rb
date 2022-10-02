class Api::V1::KeyTagsController < Api::V1::ApiController
  def create
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:key_id])
    tag = project.tags.find(params[:tag_id])

    key_tag = KeyTag.new
    key_tag.key = key
    key_tag.tag = tag

    authorize key_tag

    if key_tag.save
      render json: { error: false, message: 'TAG_ADDED_TO_KEY' }, status: :ok
    elsif key_tag.errors[:tag_id].first == 'has already been taken'
      render json: { error: true, message: 'TAG_HAS_ALREADY_BEEN_ADDED' }, status: :conflict
    else
      # :nocov:
      render json: { error: true, message: 'UNKNOWN_ERROR', details: key_tag.errors.details }, status: :bad_request
      # :nocov:
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    key = project.keys.find(params[:key_id])
    tag = project.tags.find(params[:id])

    key_tag = key.key_tags.find_by!(key_id: key.id, tag_id: tag.id)

    authorize key_tag

    if key_tag.destroy
      render json: { error: false, message: 'TAG_REMOVED_FROM_KEY' }, status: :ok
    else
      # :nocov:
      render json: { error: true, message: 'UNKNOWN_ERROR', details: key_tag.errors.details }, status: :bad_request
      # :nocov:
    end
  end
end
