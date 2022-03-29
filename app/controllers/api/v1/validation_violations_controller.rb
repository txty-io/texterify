class Api::V1::ValidationViolationsController < Api::V1::ApiController
  def index
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    validation_violations = project.validation_violations

    if params[:only_ignored] == 'true'
      validation_violations = validation_violations.where(ignored: true)
    end

    if params[:only_unignored] == 'true'
      validation_violations = validation_violations.where(ignored: false)
    end

    options = {}
    options[:meta] = { total: project.validation_violations.size }
    options[:include] = [
      :project,
      :validation,
      :translation,
      :forbidden_word,
      :'translation.key',
      :'translation.language',
      :'translation.language.language_code',
      :'translation.language.country_code'
    ]
    render json:
             ValidationViolationSerializer.new(
               validation_violations.order('id ASC').offset(page * per_page).limit(per_page),
               options
             ).serialized_json
  end

  def count
    skip_authorization

    project = current_user.projects.find(params[:project_id])

    render json: { total: project.issues_count }
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    validation_violation = project.validation_violations.find(params[:id])
    authorize validation_violation
    validation_violation.destroy

    render json: { success: true, details: 'VALIDATION_VIOLATION_DELETED' }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    validation_violations_to_destroy = project.validation_violations.find(params[:validation_violation_ids])
    validation_violations_to_destroy.each { |validation_violation| authorize validation_violation }
    project.validation_violations.destroy(validation_violations_to_destroy)

    render json: { success: true, details: 'VALIDATION_VIOLATIONS_DELETED' }
  end

  def update
    project = current_user.projects.find(params[:project_id])
    validation_violation = project.validation_violations.find(params[:id])
    authorize validation_violation
    validation_violation.ignored = params[:ignored]
    validation_violation.save!

    render json: { success: true, details: 'VALIDATION_VIOLATION_UPDATED' }
  end

  def update_multiple
    project = current_user.projects.find(params[:project_id])
    validation_violations_to_ignore = project.validation_violations.find(params[:validation_violation_ids])
    validation_violations_to_ignore.each do |validation_violation|
      authorize validation_violation
      validation_violation.ignored = params[:ignored]
      validation_violation.save!
    end

    render json: { success: true, details: 'VALIDATION_VIOLATIONS_UPDATED' }
  end
end
