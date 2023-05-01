class MigrateOldPlans < ActiveRecord::Migration[6.1]
  def change
    Subscription.where(plan: 'basic').update(plan: 'basic_old')
    Subscription.where(plan: 'team').update(plan: 'team_old')
    Subscription.where(plan: 'business').update(plan: 'business_old')
  end
end
