class Api::V1::PostProcessingRulesController < Api::V1::ApiController
  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    post_processing_rules = project.post_processing_rules.order_by_name

    options = {}
    options[:meta] = { total: post_processing_rules.size }
    options[:include] = [:export_config]
    render json:
             PostProcessingRuleSerializer.new(post_processing_rules.offset(page * per_page).limit(per_page), options)
               .serialized_json
  end

  def create
    project = current_user.projects.find(params[:project_id])

    post_processing_rule = PostProcessingRule.new(post_processing_rule_params)
    post_processing_rule.project = project

    if params[:export_config_id].present?
      export_config = project.export_configs.find(params[:export_config_id])
      post_processing_rule.export_config = export_config
    end

    authorize post_processing_rule
    unless feature_enabled?(project, Organization::FEATURE_POST_PROCESSING)
      return
    end

    if post_processing_rule.save
      render json: PostProcessingRuleSerializer.new(post_processing_rule).serialized_json
    else
      render json: { errors: post_processing_rule.errors.details }, status: :bad_request
    end
  end

  def destroy
    project = current_user.projects.find(params[:project_id])
    post_processing_rule_to_destroy = project.post_processing_rules.find(params[:post_processing_rule][:id])
    authorize post_processing_rule_to_destroy
    project.post_processing_rules.destroy(post_processing_rules_to_destroy)

    render json: { success: true, details: 'OK' }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])
    post_processing_rules_to_destroy = project.post_processing_rules.find(params[:rules])
    post_processing_rules_to_destroy.each { |post_processing_rule| authorize post_processing_rule }
    project.post_processing_rules.destroy(post_processing_rules_to_destroy)

    render json: { success: true, details: 'OK' }
  end

  def update
    project = current_user.projects.find(params[:project_id])
    post_processing_rule = project.post_processing_rules.find(params[:id])
    authorize post_processing_rule
    unless feature_enabled?(project, Organization::FEATURE_POST_PROCESSING)
      return
    end

    # Update export config
    if params[:export_config_id].present?
      post_processing_rule.export_config = project.export_configs.find_by(id: params[:export_config_id])
    else
      post_processing_rule.export_config = nil
    end

    if post_processing_rule.update(post_processing_rule_params)
      render json: { message: 'OK' }
    else
      render json: { errors: post_processing_rule.errors.details }, status: :bad_request
    end
  end

  private

  def post_processing_rule_params
    params.require(:post_processing_rule).permit(:name, :search_for, :replace_with)
  end
end
