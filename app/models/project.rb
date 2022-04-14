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
  has_many :validations, dependent: :destroy
  has_many :validation_violations, dependent: :destroy
  has_many :invites, class_name: 'ProjectInvite', dependent: :destroy
  has_many :background_jobs, dependent: :destroy

  # Forbidden words
  has_many :forbidden_words_lists, dependent: :destroy
  has_many :forbidden_words, through: :forbidden_words_lists

  # Tags
  has_many :tags, dependent: :destroy

  # WordPress Polylang integration
  has_many :wordpress_contents, dependent: :destroy
  has_one :wordpress_polylang_connection, dependent: :destroy

  has_one_attached :image

  def name=(name)
    self[:name] = name.strip
  end

  def users
    organization ? User.where(id: users_project.pluck(:id) + organization.users.pluck(:id)) : users_project
  end

  # The total number of validation violations.
  def issues_count
    validation_violations.where(ignored: false).size
  end

  def role_of(user)
    project_user = project_users.find_by(user_id: user.id)
    project_user ? project_user.role : organization.organization_users.find_by(user_id: user.id).role
  end

  def owners_count
    project_users.where(role: 'owner').size
  end

  def owner?(user)
    project_users.exists?(user_id: user.id, role: 'owner')
  end

  def role_of_source(user)
    project_user = project_users.find_by(user_id: user.id)
    project_user ? 'project' : 'organization'
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

  # Creates the tag if it does not exist.
  # Returns the new or already existing tag.
  def create_tag_if_not_exists(name, custom)
    tag = tags.find_by(name: name, custom: custom)

    if tag.blank?
      tag = Tag.new
      tag.name = name
      tag.custom = custom
      tag.project = self
      tag.save!
    end

    tag
  end

  # Rechecks placeholders of all keys of the project.
  def check_placeholders
    project.keys.each(&:check_placeholders)
  end
end
