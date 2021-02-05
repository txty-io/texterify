class Project < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, presence: true

  belongs_to :organization, optional: true

  has_many :keys, dependent: :destroy
  has_many :languages, dependent: :destroy
  has_many :export_configs, dependent: :destroy
  has_many :post_processing_rules, dependent: :destroy
  has_many :translations, through: :languages
  has_many :project_users, dependent: :delete_all
  has_many :project_columns, dependent: :delete_all
  has_many :versions, class_name: 'PaperTrail::Version', dependent: :delete_all
  has_many :users_project, through: :project_users, source: :user
  has_many :releases, through: :export_configs, dependent: :destroy

  has_one_attached :image

  def name=(name)
    self[:name] = name.strip
  end

  def users
    if organization
      User.where(id: users_project.pluck(:id) + organization.users.pluck(:id))
    else
      users_project
    end
  end

  def role_of(user)
    project_user = project_users.find_by(user_id: user.id)
    if project_user
      project_user.role
    else
      organization.organization_users.find_by(user_id: user.id).role
    end
  end

  def role_of_source(user)
    project_user = project_users.find_by(user_id: user.id)
    if project_user
      'project'
    else
      'organization'
    end
  end

  def feature_enabled?(feature)
    if organization
      organization.feature_enabled?(feature)
    else
      license = License.current_active

      if license
        feature_allowed_plans = Organization::FEATURES_PLANS[feature]
        feature_allowed_plans.include?(license.restrictions[:plan])
      else
        false
      end
    end
  end
end
