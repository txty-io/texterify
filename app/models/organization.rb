class Organization < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, uniqueness: true, presence: true

  has_many :organization_users, dependent: :delete_all
  has_many :users, through: :organization_users
  has_many :projects, dependent: :destroy
  has_many :project_users, through: :projects, dependent: :destroy
  has_many :subscriptions, dependent: :destroy
  has_one :custom_subscription, dependent: :nullify
  has_many :sent_emails, dependent: :destroy
  has_many :invites, class_name: 'OrganizationInvite', dependent: :destroy

  # Validations
  has_many :validations, dependent: :destroy

  # Forbidden words
  has_many :forbidden_words_lists, dependent: :destroy
  has_many :forbidden_words, through: :forbidden_words_lists

  has_one_attached :image

  def name=(name)
    self[:name] = name.strip
  end

  def active_subscription
    # Only return active subscription if no custom subscription is active.
    # Can happen if a subscription is active till the end of
    # the month like a trial or already paid period.
    unless self.custom_subscription
      subscriptions.find_by(stripe_ended_at: nil)
    end
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
    trial_ends_at.nil? ? false : Time.now.utc < trial_ends_at
  end

  def trial_days_left
    trial_ends_at.present? ? ((trial_ends_at - Time.now.utc) / 1.day.to_i).ceil : 0
  end

  def machine_translation_character_usage
    # If the organization uses a custom DeepL account use the usage from the account.
    if self.uses_custom_deepl_account?
      deepl_client = Deepl::V2::Client.new(self)
      usage = deepl_client.usage
      usage['character_count']
    else
      # Otherwise use the usage of the organization.
      self[:machine_translation_character_usage]
    end
  end

  def machine_translation_character_limit
    # If the organization uses a custom DeepL account use the limit from the account.
    if self.uses_custom_deepl_account?
      deepl_client = Deepl::V2::Client.new(self)
      usage = deepl_client.usage
      usage['character_limit']
    else
      # Otherwise use the limit set for the organization.
      self[:machine_translation_character_limit]
    end
  end

  # Returns true if the organization has a custom DeepL account set.
  def uses_custom_deepl_account?
    self.deepl_api_token.present?
  end

  # Cancels the current active trial by setting the end date to nil.
  def cancel_trial
    self.trial_ends_at = nil
    self.save!
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
  FEATURE_MACHINE_TRANSLATION_LANGUAGE = :FEATURE_MACHINE_TRANSLATION_LANGUAGE
  FEATURE_MACHINE_TRANSLATION_SUGGESTIONS = :FEATURE_MACHINE_TRANSLATION_SUGGESTIONS

  # Business plan features
  FEATURE_ADVANCED_PERMISSION_SYSTEM = :FEATURE_ADVANCED_PERMISSION_SYSTEM
  FEATURE_OTA = :FEATURE_OTA
  FEATURE_HTML_EDITOR = :FEATURE_HTML_EDITOR
  FEATURE_TEMPLATES = :FEATURE_TEMPLATES
  FEATURE_PROJECT_GROUPS = :FEATURE_PROJECT_GROUPS
  FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE = :FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE

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
    FEATURE_MACHINE_TRANSLATION_SUGGESTIONS: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_MACHINE_TRANSLATION_LANGUAGE: [Subscription::PLAN_TEAM, Subscription::PLAN_BUSINESS],
    FEATURE_ADVANCED_PERMISSION_SYSTEM: [Subscription::PLAN_BUSINESS],
    FEATURE_OTA: [Subscription::PLAN_BUSINESS],
    FEATURE_HTML_EDITOR: [Subscription::PLAN_BUSINESS],
    FEATURE_TEMPLATES: [Subscription::PLAN_BUSINESS],
    FEATURE_PROJECT_GROUPS: [Subscription::PLAN_BUSINESS],
    FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE: [Subscription::PLAN_BUSINESS]
  }.freeze

  NOT_IN_TRIAL_AVAILABLE = [:FEATURE_MACHINE_TRANSLATION_LANGUAGE, :FEATURE_MACHINE_TRANSLATION_AUTO_TRANSLATE].freeze

  FEATURES_BASIC_PLAN =
    FEATURES_PLANS.map { |feature, plans| plans.include?(Subscription::PLAN_BASIC) ? feature : nil }.reject(&:nil?)
      .freeze
  FEATURES_TEAM_PLAN =
    FEATURES_PLANS.map { |feature, plans| plans.include?(Subscription::PLAN_TEAM) ? feature : nil }.reject(&:nil?)
      .freeze
  FEATURES_BUSINESS_PLAN =
    FEATURES_PLANS.map { |feature, plans| plans.include?(Subscription::PLAN_BUSINESS) ? feature : nil }.reject(&:nil?)
      .freeze
  FEATURES_TRIAL =
    FEATURES_PLANS.map do |feature, plans|
      plans.include?(Subscription::PLAN_BUSINESS) && NOT_IN_TRIAL_AVAILABLE.exclude?(feature) ? feature : nil
    end.reject(&:nil?).freeze

  def feature_enabled?(feature)
    feature_allowed_plans = FEATURES_PLANS[feature]
    license = License.current_active

    return(
      (custom_subscription && feature_allowed_plans.include?(custom_subscription.plan)) ||
        (trial_active && NOT_IN_TRIAL_AVAILABLE.exclude?(feature)) ||
        (active_subscription && feature_allowed_plans.include?(active_subscription.plan)) ||
        (license && feature_allowed_plans.include?(license.restrictions[:plan]))
    )
  end

  # Returns the max amount of users for an organization.
  def users_limit
    if custom_subscription
      custom_subscription.max_users
    elsif trial_active
      nil
    elsif active_subscription
      nil
    else
      license = License.current_active

      if license
        # For on-premise the users limit is not on a per organization basis.
        # Users are then checked on an instance level.
        nil
      else
        1
      end
    end
  end

  # Returns the number of active (non-deactivated) unique users in the organization or in any of organization projects.
  def active_users_count
    (
      self.project_users.where(deactivated: false).pluck(:id) +
        self.organization_users.where(deactivated: false).pluck(:id)
    ).size
  end

  # Returns true if the organization users limit has been reached.
  def max_users_reached
    self.users_limit.nil? ? false : self.active_users_count >= self.users_limit
  end

  # Checks if the number of characters would exceed the machine translation limit of the organization.
  def exceeds_machine_translation_usage?(character_count)
    return self.machine_translation_character_usage + character_count > self.machine_translation_character_limit
  end

  # Deactivates all users who exceed the max users of the organization.
  # Returns the number of users that have been deactivated.
  def deactivate_users_that_exceed_plan
    users_limit = self.users_limit
    total_users_count = self.active_users_count

    # If the user limit is nil then there is no users limit for this organization.
    if !users_limit.nil?
      users_to_deactivate = total_users_count - users_limit

      if users_to_deactivate > 0
        project_users_ids = self.project_users.where(deactivated: false).pluck(:id)
        organization_users_ids = self.organization_users.where(deactivated: false).pluck(:id)
        project_users_only_ids = project_users_ids - organization_users_ids
        newly_deactivated_users = 0

        # Deactivate project only users.
        if !project_users_only_ids.empty?
          project_users_only = self.project_users.where(id: project_users_only_ids).order(created_at: :desc)

          project_users_only
            .take(users_to_deactivate)
            .each do |project_user|
              project_user.deactivated = true
              project_user.deactivated_reason = 'user_limit_exceeded'
              project_user.save!
              newly_deactivated_users += 1
            end

          users_to_deactivate -= newly_deactivated_users
        end

        # Deactivate also organization users if not enough users have been deactivated to fit max users.
        if users_to_deactivate > 0
          self
            .organization_users
            .order(created_at: :desc)
            .take(users_to_deactivate)
            .each do |organization_user|
              is_last_owner =
                organization_user.role == 'owner' &&
                  self.organization_users.where(role: 'owner', deactivated: false).count == 1

              # Don't deactivate the last owner.
              if !is_last_owner
                organization_user.deactivated = true
                organization_user.deactivated_reason = 'user_limit_exceeded'
                organization_user.save!
                newly_deactivated_users += 1
              end
            end
        end

        newly_deactivated_users
      end
    end
  end
end
