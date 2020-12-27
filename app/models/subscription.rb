class Subscription < ApplicationRecord
  belongs_to :organization

  validates :stripe_id, presence: true
  validates :stripe_cancel_at_period_end, default: false
  validates :stripe_created, presence: true
  validates :stripe_current_period_start, presence: true
  validates :stripe_current_period_end, presence: true
  validates :stripe_customer, presence: true
  validates :stripe_status, presence: true
  validates :stripe_start_date, presence: true
  validates :stripe_latest_invoice, presence: true
  validates :plan, presence: true
  validates :users_count, presence: true
  validates :canceled, default: false

  # https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses
  enum stripe_status: {
    trialing: 'trialing',
    active: 'active',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid'
  }

  ACCESS_GRANTING_STATUSES = %w[trialing active past_due].freeze
  VALID_PLANS = %w[basic team business].freeze

  scope :active_or_trialing, -> { where(stripe_status: ACCESS_GRANTING_STATUSES) }

  def active_or_trialing?
    ACCESS_GRANTING_STATUSES.include?(status)
  end

  def interrupt
    if IS_TEXTERIFY_CLOUD && !canceled
      self.canceled = true
      save

      RestClient.put("#{ENV['PAYMENT_SERVICE_HOST']}/subscriptions/status?organization_id=#{organization.id}", {})
    end
  end

  def reactivate
    if IS_TEXTERIFY_CLOUD && canceled
      self.canceled = false
      save

      RestClient.put("#{ENV['PAYMENT_SERVICE_HOST']}/subscriptions/status?organization_id=#{organization.id}", {})
    end
  end

  def change_plan(plan)
    if IS_TEXTERIFY_CLOUD
      if VALID_PLANS.include?(plan)
        self.plan = plan
        self.canceled = false
        save

        RestClient.put("#{ENV['PAYMENT_SERVICE_HOST']}/subscriptions/plan?organization_id=#{organization.id}&plan=#{plan}", {})
      else
        render json: {
          errors: [
            {
              code: 'INVALID_PLAN'
            }
          ]
        }, status: :bad_request
      end
    end
  end
end
