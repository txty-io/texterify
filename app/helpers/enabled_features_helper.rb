module EnabledFeaturesHelper
  extend ActiveSupport::Concern

  class_methods do
    def enabled_features_organization(organization)
      features = []

      # First check for custom subscriptions because if a custom subscription is active a normal subscription can't be active.
      if organization&.custom_subscription
        if organization&.custom_subscription&.plan == Subscription::PLAN_BASIC
          features = Organization::FEATURES_BASIC_PLAN
        elsif organization&.custom_subscription&.plan == Subscription::PLAN_TEAM
          features = Organization::FEATURES_TEAM_PLAN
        elsif organization&.custom_subscription&.plan == Subscription::PLAN_BUSINESS
          features = Organization::FEATURES_BUSINESS_PLAN
        else
          raise StandardError
        end
      elsif organization&.active_subscription
        # Otherwise check if organization has an active subscription.
        if organization&.active_subscription&.plan == Subscription::PLAN_BASIC
          features = Organization::FEATURES_BASIC_PLAN
        elsif organization&.active_subscription&.plan == Subscription::PLAN_TEAM
          features = Organization::FEATURES_TEAM_PLAN
        elsif organization&.active_subscription&.plan == Subscription::PLAN_BUSINESS
          features = Organization::FEATURES_BUSINESS_PLAN
        else
          raise StandardError
        end
      elsif !License.all.empty?
        license = License.current_active

        if license && license.restrictions[:plan] == 'basic'
          features = Organization::FEATURES_BASIC_PLAN
        elsif license && license.restrictions[:plan] == 'team'
          features = Organization::FEATURES_TEAM_PLAN
        elsif license && license.restrictions[:plan] == 'business'
          features = Organization::FEATURES_BUSINESS_PLAN
        end
      end

      features = (features + Organization::FREE_FEATURES).uniq

      organization&.trial_active ? (features + Organization::FEATURES_TRIAL).uniq : features
    end
  end
end
