class KeySerializer
  include FastJsonapi::ObjectSerializer
  attributes :id,
             :project_id,
             :name,
             :description,
             :html_enabled,
             :name_editable,
             :created_at,
             :updated_at,
             :pluralization_enabled
  has_many :translations
  has_many :tags
  has_many :wordpress_contents
  has_many :placeholders

  attribute :editable_for_current_user, if: proc { |_, params| params[:current_user] } do |object, params|
    role = object.project.role_of(params[:current_user])

    if ROLES_DEVELOPER_UP.include? role
      true
    else
      !object.tags.exists?(disable_translation_for_translators: true)
    end
  end
end
