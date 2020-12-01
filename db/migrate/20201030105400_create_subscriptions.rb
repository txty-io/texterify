class CreateSubscriptions < ActiveRecord::Migration[6.0]
  def change
    create_table :subscriptions, id: :uuid do |t|
      t.string :stripe_id, null: false
      t.datetime :stripe_cancel_at
      t.boolean :stripe_cancel_at_period_end, null: false
      t.datetime :stripe_canceled_at
      t.datetime :stripe_created, null: false
      t.datetime :stripe_current_period_start, null: false
      t.datetime :stripe_current_period_end, null: false
      t.string :stripe_customer, null: false
      t.datetime :stripe_ended_at
      t.string :stripe_status, null: false
      t.datetime :stripe_start_date, null: false
      t.string :stripe_latest_invoice, null: false
      t.references :organization, index: true, null: false, type: :uuid, foreign_key: true
      t.timestamps
    end
  end
end
