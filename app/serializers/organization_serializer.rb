class OrganizationSerializer
  include FastJsonapi::ObjectSerializer

  attributes :id,
             :name,
             :trial_active,
             :machine_translation_character_usage,
             :machine_translation_character_limit,
             :keys_count,
             :project_count,
             :project_limit,
             :project_limit_reached,
             :language_limit_per_project,
             :deepl_api_token_type,
             :key_count,
             :key_limit,
             :key_limit_reached,
             :key_limit_exceeded,
             :active_users_count,
             :user_limit
  has_many :projects

  attribute :uses_custom_deepl_account do |object|
    object.uses_custom_deepl_account?
  end

  attribute :max_users_reached do |object|
    object.max_users_reached?
  end

  attribute :deepl_api_token do |object|
    if object.deepl_api_token
      length = object.deepl_api_token.size

      if length > 4
        # We only show the first two and last two characters in the UI.
        object.deepl_api_token[0..1] + ('*' * (length - 4)) + object.deepl_api_token[-2...]
      else
        '*' * length
      end
    end
  end

  attribute :current_user_role, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.role
  end

  attribute :trial_ends_at do |object|
    object.trial_ends_at&.strftime('%Y-%m-%d')
  end

  attribute :enabled_features do |object|
    object.current_plan&.enabled_features || []
  end

  attribute :key_count do |object|
    object.keys_count
  end

  attribute :user_limit do |object|
    object.users_limit
  end

  attribute :current_user_deactivated, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.deactivated
  end

  attribute :current_user_deactivated_reason, if: proc { |_, params| params[:current_user] } do |object, params|
    organization_user = OrganizationUser.find_by(organization_id: object.id, user_id: params[:current_user].id)
    organization_user&.deactivated_reason
  end
end
