class Organization < ApplicationRecord
  scope :order_by_name, -> { order(arel_table['name'].lower.asc) }

  validates :name, uniqueness: true, presence: true

  has_many :organization_users, dependent: :delete_all
  has_many :users, through: :organization_users
  has_many :projects, dependent: :destroy
  has_many :project_users, through: :projects, dependent: :destroy
  has_many :subscriptions, dependent: :destroy
  has_many :sent_emails, dependent: :destroy
  has_many :invites, class_name: 'OrganizationInvite', dependent: :destroy

  # Subscription
  has_one :custom_subscription, dependent: :nullify

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
    organization_user&.role
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
      deepl_client = Deepl::Client.new(self)
      usage = deepl_client.usage
      if usage
        return usage['character_count'] || 0
      else
        return 0
      end
    else
      # Otherwise use the usage of the organization.
      return self[:machine_translation_character_usage]
    end
  end

  def machine_translation_character_limit
    # If the organization uses a custom DeepL account use the limit from the account.
    if self.uses_custom_deepl_account?
      deepl_client = Deepl::Client.new(self)
      usage = deepl_client.usage
      if usage
        usage['character_limit']
      end
    else
      # Otherwise use the limit set for the organization.
      self[:machine_translation_character_limit]
    end
  end

  # Returns the number of projects.
  def project_count
    self.projects.size
  end

  # Returns the max number of projects or nil if there is no limit.
  def project_limit
    organization_plan = self.current_plan
    organization_plan&.projects_limit
  end

  # Returns true if the max number of projects has been reached.
  def project_limit_reached
    self.project_limit.nil? ? false : self.projects.size >= self.project_limit
  end

  # Returns the max number of languages per project or nil if there is no limit.
  def language_limit_per_project
    organization_plan = self.current_plan
    organization_plan&.languages_limit
  end

  # Returns true if the organization has a custom DeepL account set.
  def uses_custom_deepl_account?
    self.deepl_api_token.present? && self.deepl_api_token_type.present?
  end

  # Cancels the current active trial by setting the end date to nil.
  def cancel_trial
    self.trial_ends_at = nil
    self.save!
  end

  def current_plan
    current_plan_name = 'free'

    if custom_subscription&.plan
      current_plan_name = custom_subscription.plan
    elsif active_subscription&.plan
      current_plan_name = active_subscription.plan
    elsif trial_active
      current_plan_name = 'trial'
    else
      license = License.current_active
      if license&.restrictions
        current_plan_name = license.restrictions[:plan]
      end
    end

    Plan.find_by(name: current_plan_name || 'free')
  end

  def feature_enabled?(feature)
    plan = current_plan
    plan ? plan.feature_enabled?(feature) : false
  end

  def enabled_features
    current_plan&.enabled_features
  end

  # Returns the max amount of users for an organization.
  def users_limit
    if custom_subscription
      custom_subscription.max_users
    elsif trial_active || active_subscription
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

  # Returns the number of active (non-deactivated) unique users in the organization or in any of the organization projects.
  def active_users_count
    (
      self
        .project_users
        .joins(:user)
        .where('projects_users.deactivated = false and users.deactivated = false')
        .pluck(:id) +
        self
          .organization_users
          .joins(:user)
          .where('organizations_users.deactivated = false and users.deactivated = false')
          .pluck(:id)
    ).size
  end

  # Returns true if the users limit has been reached.
  def max_users_reached?
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
