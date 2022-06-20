class CreateCustomSubscriptions < ActiveRecord::Migration[6.1]
  def change
    create_table :custom_subscriptions, id: :uuid do |t|
      t.string :plan, null: false
      t.string :provider, null: false
      t.string :provider_plan
      t.string :provider_license_key
      t.string :invoice_id
      t.string :redeemable_by_email, null: false
      t.integer :max_users
      t.integer :machine_translation_character_limit
      t.datetime :ends_at
      t.references :organization, index: true, null: true, type: :uuid, foreign_key: { on_delete: :nullify }
      t.timestamps
    end

    # An organization can only have one custom subscription.
    add_index :custom_subscriptions,
              [:organization_id],
              unique: true,
              name: 'custom_subscriptions_organization_id_unique'
  end
end
