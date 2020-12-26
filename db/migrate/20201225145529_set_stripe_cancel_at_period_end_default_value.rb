class SetStripeCancelAtPeriodEndDefaultValue < ActiveRecord::Migration[6.0]
  def change
    change_column_default :subscriptions, :stripe_cancel_at_period_end, from: nil, to: false
  end
end
