module EnabledFeaturesHelper
  extend ActiveSupport::Concern

  class_methods do
    def enabled_features_organization(organization)
      features = []

      if organization&.active_subscription&.plan == Subscription::PLAN_BASIC
        features = Organization::FEATURES_BASIC_PLAN
      elsif organization&.active_subscription&.plan == Subscription::PLAN_TEAM
        features = Organization::FEATURES_TEAM_PLAN
      elsif organization&.active_subscription&.plan == Subscription::PLAN_BUSINESS
        features = Organization::FEATURES_BUSINESS_PLAN
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

      organization&.trial_active ? (features + Organization::FEATURES_TRIAL).uniq : features
    end
  end
end
