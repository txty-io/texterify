class Organization < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, uniqueness: true, presence: true

  has_many :organization_users, dependent: :delete_all
  has_many :users, through: :organization_users
  has_many :projects, dependent: :destroy
  has_many :project_users, through: :projects, dependent: :destroy
  has_many :subscriptions, dependent: :destroy
  has_many :sent_organization_emails, dependent: :destroy

  has_one_attached :image

  def name=(name)
    self[:name] = name.strip
  end

  def active_subscription
    subscriptions.find_by(stripe_ended_at: nil)
  end

  def role_of(user)
    organization_user = organization_users.find_by(user_id: user.id)
    organization_user ? organization_user.role : nil
  end

  def owners
    organization_users.where(role: 'owner').map(&:user)
  end

  def owners_count
    organization_users.where(role: 'owner').size
  end

  def owner?(user)
    organization_users.exists?(user_id: user.id, role: 'owner')
  end

  def trial_active
    if trial_ends_at.nil?
      false
    else
      Time.now.utc < trial_ends_at
    end
  end

  # Basic plan features
  FEATURE_UNLIMITED_PROJECTS = :FEATURE_UNLIMITED_PROJECTS
  FEATURE_UNLIMITED_LANGUAGES = :FEATURE_UNLIMITED_LANGUAGES
  FEATURE_BASIC_PERMISSION_SYSTEM = :FEATURE_BASIC_PERMISSION_SYSTEM

  # Team plan features
  FEATURE_VALIDATIONS = :FEATURE_VALIDATIONS
  FEATURE_KEY_HISTORY = :FEATURE_KEY_HISTORY
  FEATURE_EXPORT_HIERARCHY = :FEATURE_EXPORT_HIERARCHY
  FEATURE_POST_PROCESSING = :FEATURE_POST_PROCESSING
  FEATURE_PROJECT_ACTIVITY = :FEATURE_PROJECT_ACTIVITY
  FEATURE_TAG_MANAGEMENT = :FEATURE_TAG_MANAGEMENT

  # Business plan features
  FEATURE_ADVANCED_PERMISSION_SYSTEM = :FEATURE_ADVANCED_PERMISSION_SYSTEM
  FEATURE_OTA = :FEATURE_OTA
  FEATURE_HTML_EDITOR = :FEATURE_HTML_EDITOR
  FEATURE_TEMPLATES = :FEATURE_TEMPLATES
  FEATURE_PROJECT_GROUPS = :FEATURE_PROJECT_GROUPS
  FEATURE_MACHINE_TRANSLATIONS = :FEATURE_MACHINE_TRANSLATIONS

  FEATURES_PLANS = {
    FEATURE_UNLIMITED_PROJECTS: [Subscription::PLAN_BASIC, Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_UNLIMITED_LANGUAGES: [Subscription::PLAN_BASIC, Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_BASIC_PERMISSION_SYSTEM: [Subscription::PLAN_BASIC, Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],

    FEATURE_VALIDATIONS: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_KEY_HISTORY: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_EXPORT_HIERARCHY: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_POST_PROCESSING: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_PROJECT_ACTIVITY: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_TAG_MANAGEMENT: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],

    FEATURE_ADVANCED_PERMISSION_SYSTEM: [Subscription::PLAN_BUSINESS],
    FEATURE_OTA: [Subscription::PLAN_BUSINESS],
    FEATURE_HTML_EDITOR: [Subscription::PLAN_BUSINESS],
    FEATURE_TEMPLATES: [Subscription::PLAN_BUSINESS],
    FEATURE_PROJECT_GROUPS: [Subscription::PLAN_BUSINESS],
    FEATURE_MACHINE_TRANSLATIONS: [Subscription::PLAN_BUSINESS]
  }.freeze

  FEATURES_BASIC_PLAN = FEATURES_PLANS.map { |feature, plans| plans.include?(Subscription::PLAN_BASIC) ? feature : nil }.reject(&:nil?).freeze
  FEATURES_TEAM_PLAN = FEATURES_PLANS.map { |feature, plans| plans.include?(Subscription::PLAN_TEAM) ? feature : nil }.reject(&:nil?).freeze
  FEATURES_BUSINESS_PLAN = FEATURES_PLANS.map { |feature, plans| plans.include?(Subscription::PLAN_BUSINESS) ? feature : nil }.reject(&:nil?).freeze

  def feature_enabled?(feature)
    feature_allowed_plans = FEATURES_PLANS[feature]
    license = License.current_active

    return trial_active ||
           (active_subscription && feature_allowed_plans.include?(active_subscription.plan)) ||
           (license && feature_allowed_plans.include?(license.restrictions[:plan]))
  end
end
